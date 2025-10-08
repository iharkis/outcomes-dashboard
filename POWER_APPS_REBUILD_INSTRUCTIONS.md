# Power Apps Rebuild Instructions

## Step-by-Step Guide to Rebuild in Power Apps

### Prerequisites
1. SQL Server database with schema deployed (use `SQL_SERVER_SCHEMA.sql`)
2. Power Apps environment with access to SQL Server connector
3. Power Apps Premium license (required for SQL Server connections)

### Phase 1: Database Setup and Connection

#### Step 1: Deploy SQL Schema
1. Execute the `SQL_SERVER_SCHEMA.sql` script in your SQL Server instance
2. Verify all tables, relationships, and stored procedures are created
3. Note the database connection details (server, database name, authentication)

#### Step 2: Create Power Apps Data Sources
1. Open Power Apps Studio
2. Create a new Canvas App (Tablet layout recommended)
3. Add SQL Server connector:
   - Go to Data > Add data
   - Search for "SQL Server"
   - Enter connection details
   - Select the ProjectPlanningDB database
   - Choose these tables:
     - Projects
     - Outcomes
     - Touchpoints
     - Indicators
     - IndicatorOutcomes
     - IndicatorTouchpoints

### Phase 2: Application Structure Setup

#### Step 3: Create Global Variables and Collections
Add this formula to the App's **OnStart** property:
```powerquery
// Initialize global variables
Set(ShowNewProjectForm, false);
Set(ShowAddOutcomeForm, false);
Set(ShowAddTouchpointForm, false);
Set(ShowAddIndicatorForm, false);
Set(SelectedProject, Blank());
Set(EditingOutcome, Blank());
Set(EditingTouchpoint, Blank());
Set(EditingIndicator, Blank());

// Load data into collections for better performance
ClearCollect(
    ProjectsCollection,
    AddColumns(
        Filter(Projects, IsActive = true),
        "DisplayText", Name & " (" & Reference & ")"
    )
);

// Initialize empty collections that will be populated when project is selected
Clear(OutcomesCollection);
Clear(TouchpointsCollection);
Clear(IndicatorsCollection);
```

#### Step 4: Create Main Screen Layout
1. Add a **Container** control named `MainContainer`
2. Set Layout Direction: Vertical
3. Add these sections as child containers:
   - `HeaderContainer`
   - `ProjectSelectionContainer`
   - `ProjectDetailsContainer`

### Phase 3: Header Section

#### Step 5: Build Header
In `HeaderContainer`:
1. Add **Label** control: "Project Planning Data Capture System"
2. Set properties:
   - Font size: 24
   - Font weight: Bold
   - Align: Center
   - Color: RGBA(44, 62, 80, 1)

### Phase 4: Project Selection Section

#### Step 6: Create Project Selection Controls
In `ProjectSelectionContainer`:

1. **Add Project Selection ComboBox:**
   - Name: `ComboBox_Projects`
   - Items: `ProjectsCollection`
   - DisplayFields: `["DisplayText"]`
   - SearchFields: `["Name", "Reference"]`
   - DefaultSelectedItems: `[]`

2. **Add "Create New Project" Button:**
   - Name: `Button_NewProject`
   - Text: "Create New Project"
   - OnSelect: `Set(ShowNewProjectForm, true)`

#### Step 7: Create New Project Form
Add a **Container** named `NewProjectFormContainer`:
- Visible: `ShowNewProjectForm`

Inside this container add:

1. **Project Name Input:**
   - Name: `TextInput_ProjectName`
   - HintText: "Enter project name"

2. **Reference Number Input:**
   - Name: `TextInput_ProjectRef`
   - HintText: "Enter reference number"

3. **Save Button:**
   - Name: `Button_SaveProject`
   - Text: "Save Project"
   - OnSelect:
   ```powerquery
   If(
       IsBlank(TextInput_ProjectName.Text) || IsBlank(TextInput_ProjectRef.Text),
       Notify("Please fill in both project name and reference number", NotificationType.Error),
       With({
           NewProject: Patch(
               Projects,
               Defaults(Projects),
               {
                   Name: TextInput_ProjectName.Text,
                   Reference: TextInput_ProjectRef.Text,
                   IsActive: true
               }
           )
       },
           // Refresh projects collection
           ClearCollect(
               ProjectsCollection,
               AddColumns(
                   Filter(Projects, IsActive = true),
                   "DisplayText", Name & " (" & Reference & ")"
               )
           );
           // Select the new project
           Set(SelectedProject, NewProject);
           // Hide form and reset inputs
           Set(ShowNewProjectForm, false);
           Reset(TextInput_ProjectName);
           Reset(TextInput_ProjectRef);
           Notify("Project created successfully", NotificationType.Success)
       )
   )
   ```

4. **Cancel Button:**
   - Name: `Button_CancelProject`
   - Text: "Cancel"
   - OnSelect: `Set(ShowNewProjectForm, false); Reset(TextInput_ProjectName); Reset(TextInput_ProjectRef)`

#### Step 8: Project Selection Logic
Set ComboBox_Projects **OnChange** property:
```powerquery
If(
    !IsBlank(ComboBox_Projects.Selected),
    // Set selected project
    Set(SelectedProject, ComboBox_Projects.Selected);

    // Load project-specific data
    ClearCollect(
        OutcomesCollection,
        AddColumns(
            Filter(Outcomes, ProjectId = SelectedProject.Id && IsActive = true),
            "Letter", Char(64 + SequenceOrder)
        )
    );

    ClearCollect(
        TouchpointsCollection,
        AddColumns(
            Filter(Touchpoints, ProjectId = SelectedProject.Id && IsActive = true),
            "DisplayNumber", "TP" & SequenceOrder
        )
    );

    ClearCollect(
        IndicatorsCollection,
        Filter(Indicators, ProjectId = SelectedProject.Id && IsActive = true)
    ),

    // Clear selection
    Set(SelectedProject, Blank());
    Clear(OutcomesCollection);
    Clear(TouchpointsCollection);
    Clear(IndicatorsCollection)
)
```

### Phase 5: Project Details Section

#### Step 9: Create Project Details Container
Add `ProjectDetailsContainer`:
- Visible: `!IsBlank(SelectedProject)`

Add project info display:
1. **Project Name Label:** Text: `SelectedProject.Name`
2. **Reference Label:** Text: `"Reference: " & SelectedProject.Reference`

### Phase 6: Outcomes Section

#### Step 10: Build Outcomes Section
In `ProjectDetailsContainer`, add `OutcomesContainer`:

1. **Section Header:** "Outcomes"
2. **Add Outcome Button:**
   - Text: "Add Outcome"
   - OnSelect: `Set(ShowAddOutcomeForm, true)`

3. **Outcomes Gallery:**
   - Name: `Gallery_Outcomes`
   - Items: `OutcomesCollection`
   - Template content:
     - **Letter Label:** Text: `ThisItem.Letter`
     - **Heading Label:** Text: `ThisItem.Heading`
     - **Description Label:** Text: `ThisItem.Description`
     - **Edit Button:** OnSelect: `Set(EditingOutcome, ThisItem)`
     - **Delete Button:** OnSelect: Delete outcome logic (see below)

#### Step 11: Add Outcome Form
Create form container (Visible: `ShowAddOutcomeForm`):

1. **Heading Input:** `TextInput_OutcomeHeading`
2. **Description Input:** `TextInput_OutcomeDescription`
3. **Save Button OnSelect:**
```powerquery
If(
    IsBlank(TextInput_OutcomeHeading.Text),
    Notify("Please enter an outcome heading", NotificationType.Error),
    With({
        NextSequence: CountRows(OutcomesCollection) + 1
    },
        Patch(
            Outcomes,
            Defaults(Outcomes),
            {
                ProjectId: SelectedProject.Id,
                Heading: TextInput_OutcomeHeading.Text,
                Description: TextInput_OutcomeDescription.Text,
                SequenceOrder: NextSequence,
                IsActive: true
            }
        );

        // Refresh outcomes collection
        ClearCollect(
            OutcomesCollection,
            AddColumns(
                Filter(Outcomes, ProjectId = SelectedProject.Id && IsActive = true),
                "Letter", Char(64 + SequenceOrder)
            )
        );

        // Hide form and reset
        Set(ShowAddOutcomeForm, false);
        Reset(TextInput_OutcomeHeading);
        Reset(TextInput_OutcomeDescription);
        Notify("Outcome added successfully", NotificationType.Success)
    )
)
```

### Phase 7: Touchpoints Section

#### Step 12: Build Touchpoints Section
Similar to outcomes but with "TP" numbering:

1. **Touchpoints Gallery:** Items: `TouchpointsCollection`
2. **Add Touchpoint Form** with save logic:
```powerquery
With({
    NextSequence: CountRows(TouchpointsCollection) + 1
},
    Patch(
        Touchpoints,
        Defaults(Touchpoints),
        {
            ProjectId: SelectedProject.Id,
            Heading: TextInput_TouchpointHeading.Text,
            Description: TextInput_TouchpointDescription.Text,
            SequenceOrder: NextSequence,
            IsActive: true
        }
    );

    // Refresh collection...
)
```

### Phase 8: Indicators Section

#### Step 13: Build Indicators Section
1. **Indicators Gallery:** Items: `IndicatorsCollection`
2. **Gallery Template** should display:
   - Indicator description
   - Baseline value
   - Related outcomes (use formula below)
   - Related touchpoints (use formula below)

**Formula for displaying related outcomes:**
```powerquery
Concat(
    ForAll(
        Filter(
            IndicatorOutcomes,
            IndicatorId = ThisItem.Id
        ),
        LookUp(
            OutcomesCollection,
            Id = OutcomeId,
            Letter
        )
    ),
    Value,
    ", "
)
```

**Formula for displaying related touchpoints:**
```powerquery
Concat(
    ForAll(
        Filter(
            IndicatorTouchpoints,
            IndicatorId = ThisItem.Id
        ),
        LookUp(
            TouchpointsCollection,
            Id = TouchpointId,
            DisplayNumber
        )
    ),
    Value,
    ", "
)
```

#### Step 14: Add Indicator Form
Complex form with checkboxes for relationships:

1. **Description Input:** `TextInput_IndicatorDescription`
2. **Baseline Input:** `TextInput_IndicatorBaseline`

3. **Outcomes Checkbox Gallery:**
   - Items: `OutcomesCollection`
   - Template: Checkbox with outcome letter and heading
   - Checkbox OnCheck/OnUncheck: Store selections in collection

4. **Touchpoints Checkbox Gallery:**
   - Items: `TouchpointsCollection`
   - Template: Checkbox with touchpoint number and heading

5. **Save Button OnSelect:**
```powerquery
If(
    IsBlank(TextInput_IndicatorDescription.Text),
    Notify("Please enter an indicator description", NotificationType.Error),
    With({
        NewIndicator: Patch(
            Indicators,
            Defaults(Indicators),
            {
                ProjectId: SelectedProject.Id,
                Description: TextInput_IndicatorDescription.Text,
                Baseline: TextInput_IndicatorBaseline.Text,
                IsActive: true
            }
        )
    },
        // Save outcome relationships
        ForAll(
            Filter(Gallery_OutcomeCheckboxes.AllItems, Checkbox_Outcome.Value = true),
            Patch(
                IndicatorOutcomes,
                Defaults(IndicatorOutcomes),
                {
                    IndicatorId: NewIndicator.Id,
                    OutcomeId: ThisRecord.Outcome.Id
                }
            )
        );

        // Save touchpoint relationships
        ForAll(
            Filter(Gallery_TouchpointCheckboxes.AllItems, Checkbox_Touchpoint.Value = true),
            Patch(
                IndicatorTouchpoints,
                Defaults(IndicatorTouchpoints),
                {
                    IndicatorId: NewIndicator.Id,
                    TouchpointId: ThisRecord.Touchpoint.Id
                }
            )
        );

        // Refresh and cleanup...
    )
)
```

### Phase 9: Edit and Delete Operations

#### Step 15: Implement Edit Operations
For each section, create edit forms similar to add forms but:
1. Pre-populate with existing data
2. Use `Patch` with existing record instead of `Defaults`
3. Update relationships by removing old ones and adding new ones

#### Step 16: Implement Delete Operations
**Delete Outcome:**
```powerquery
// Remove from outcomes
Remove(Outcomes, Gallery_Outcomes.Selected);

// Remove relationships
RemoveIf(IndicatorOutcomes, OutcomeId = Gallery_Outcomes.Selected.Id);

// Reorder remaining outcomes
ForAll(
    Filter(OutcomesCollection, SequenceOrder > Gallery_Outcomes.Selected.SequenceOrder),
    Patch(
        Outcomes,
        LookUp(Outcomes, Id = ThisRecord.Id),
        {SequenceOrder: ThisRecord.SequenceOrder - 1}
    )
);

// Refresh collection
```

### Phase 10: Styling and Polish

#### Step 17: Apply Consistent Styling
1. Create a consistent color scheme
2. Set appropriate fonts and sizes
3. Add proper spacing and alignment
4. Implement responsive design for different screen sizes

#### Step 18: Add Validation and Error Handling
1. Add validation to all forms
2. Implement proper error messages
3. Add loading indicators for data operations
4. Handle edge cases (empty lists, etc.)

### Phase 11: Testing and Deployment

#### Step 19: Test All Functionality
1. Test project creation and selection
2. Verify auto-lettering and numbering
3. Test all CRUD operations
4. Verify many-to-many relationships
5. Test data persistence

#### Step 20: Deploy and Train Users
1. Save and publish the app
2. Set appropriate permissions
3. Train users on the interface
4. Document any differences from the HTML prototype

### Performance Optimization Tips

1. **Use Delegable Formulas:** Ensure queries can be delegated to SQL Server
2. **Limit Collection Size:** Use Filter() to load only necessary data
3. **Cache Frequently Used Data:** Store lookup data in collections
4. **Optimize Gallery Performance:** Use fewer controls in gallery templates
5. **Use OnVisible Events:** Load data only when screens are visible

### Troubleshooting Common Issues

1. **Delegation Warnings:** Redesign formulas to be delegable
2. **Slow Performance:** Reduce collection sizes and optimize queries
3. **Relationship Issues:** Verify foreign key constraints in SQL
4. **Data Not Updating:** Check refresh logic and collection updates
5. **Permission Errors:** Verify SQL Server connection and user permissions