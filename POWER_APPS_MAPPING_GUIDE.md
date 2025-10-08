# Power Apps Mapping Guide

## HTML/JavaScript to Power Apps Component Mapping

### 1. Overall Application Structure

| HTML/JavaScript Component | Power Apps Equivalent | Notes |
|---------------------------|----------------------|-------|
| `<div class="container">` | Canvas App Screen | Main container becomes the screen |
| CSS Flexbox/Grid Layout | Container Controls | Use containers for layout organization |
| JavaScript Classes | Power Apps Collections | App logic becomes formulas and collections |

### 2. Project Selection Section

| HTML Element | Power Apps Component | Properties/Configuration |
|-------------|---------------------|-------------------------|
| `<select id="project-select">` | ComboBox Control | Items: Projects collection, DisplayFields: Name & Reference |
| `<button id="new-project-btn">` | Button Control | OnSelect: Set(ShowNewProjectForm, true) |
| `<div id="new-project-form">` | Container Control | Visible: ShowNewProjectForm |
| `<input id="project-name">` | Text Input Control | Default: "" |
| `<input id="project-ref">` | Text Input Control | Default: "" |

**Power Fx Formula Example:**
```powerquery
// Project ComboBox Items
Projects

// Save New Project OnSelect
Patch(Projects, Defaults(Projects), {
    Name: TextInput_ProjectName.Text,
    Reference: TextInput_ProjectRef.Text,
    CreatedDate: Now()
});
Set(ShowNewProjectForm, false);
Reset(TextInput_ProjectName);
Reset(TextInput_ProjectRef)
```

### 3. Outcomes Section

| HTML Element | Power Apps Component | Configuration |
|-------------|---------------------|---------------|
| `<div id="outcomes-list">` | Gallery Control | Items: Filter(Outcomes, ProjectId = ComboBox_Projects.Selected.Id) |
| Outcome Cards | Gallery Template | Contains Label controls for letter, heading, description |
| Edit/Delete Buttons | Button Controls | In gallery template |
| Add Outcome Form | Container Control | Form controls for input |

**Power Fx Formula Example:**
```powerquery
// Auto-letter generation in Gallery
Char(65 + ThisItem.Index - 1)  // A, B, C, etc.

// Add Outcome OnSelect
Patch(Outcomes, Defaults(Outcomes), {
    ProjectId: ComboBox_Projects.Selected.Id,
    Heading: TextInput_OutcomeHeading.Text,
    Description: TextInput_OutcomeDescription.Text,
    Index: CountRows(Filter(Outcomes, ProjectId = ComboBox_Projects.Selected.Id)) + 1
})
```

### 4. Touchpoints Section

| HTML Element | Power Apps Component | Configuration |
|-------------|---------------------|---------------|
| `<div id="touchpoints-list">` | Gallery Control | Items: Filter(Touchpoints, ProjectId = ComboBox_Projects.Selected.Id) |
| Touchpoint Cards | Gallery Template | Contains Label controls for TP number, heading, description |

**Power Fx Formula Example:**
```powerquery
// Auto-numbering in Gallery
"TP" & ThisItem.Index

// Add Touchpoint OnSelect
Patch(Touchpoints, Defaults(Touchpoints), {
    ProjectId: ComboBox_Projects.Selected.Id,
    Heading: TextInput_TouchpointHeading.Text,
    Description: TextInput_TouchpointDescription.Text,
    Index: CountRows(Filter(Touchpoints, ProjectId = ComboBox_Projects.Selected.Id)) + 1
})
```

### 5. Indicators Section

| HTML Element | Power Apps Component | Configuration |
|-------------|---------------------|---------------|
| `<div id="indicators-list">` | Gallery Control | Items: Filter(Indicators, ProjectId = ComboBox_Projects.Selected.Id) |
| Outcomes Checkboxes | Gallery of Checkboxes | Items: Filter(Outcomes, ProjectId = ComboBox_Projects.Selected.Id) |
| Touchpoints Checkboxes | Gallery of Checkboxes | Items: Filter(Touchpoints, ProjectId = ComboBox_Projects.Selected.Id) |

**Power Fx Formula Example:**
```powerquery
// Save Indicator with Relationships OnSelect
With({
    NewIndicator: Patch(Indicators, Defaults(Indicators), {
        ProjectId: ComboBox_Projects.Selected.Id,
        Description: TextInput_IndicatorDescription.Text,
        Baseline: TextInput_IndicatorBaseline.Text
    })
},
    // Save Outcome Relationships
    ForAll(
        Filter(Gallery_OutcomeCheckboxes.AllItems, Checkbox.Value = true),
        Patch(IndicatorOutcomes, Defaults(IndicatorOutcomes), {
            IndicatorId: NewIndicator.Id,
            OutcomeId: Outcome.Id
        })
    );
    // Save Touchpoint Relationships
    ForAll(
        Filter(Gallery_TouchpointCheckboxes.AllItems, Checkbox.Value = true),
        Patch(IndicatorTouchpoints, Defaults(IndicatorTouchpoints), {
            IndicatorId: NewIndicator.Id,
            TouchpointId: Touchpoint.Id
        })
    )
)
```

### 6. Data Management

| JavaScript Functionality | Power Apps Equivalent | Implementation |
|--------------------------|----------------------|----------------|
| `localStorage.setItem()` | Automatic with SQL Server | Data connector handles persistence |
| `localStorage.getItem()` | OnStart App Formula | Load initial collections |
| Array manipulation | Collection functions | Use Collect, Patch, Remove functions |
| Event listeners | Control OnSelect properties | Direct formula binding |

**Power Fx OnStart Formula:**
```powerquery
// Load initial data
ClearCollect(Projects, '[dbo].[Projects]');
ClearCollect(Outcomes, '[dbo].[Outcomes]');
ClearCollect(Touchpoints, '[dbo].[Touchpoints]');
ClearCollect(Indicators, '[dbo].[Indicators]');
ClearCollect(IndicatorOutcomes, '[dbo].[IndicatorOutcomes]');
ClearCollect(IndicatorTouchpoints, '[dbo].[IndicatorTouchpoints]');

// Initialize variables
Set(ShowNewProjectForm, false);
Set(SelectedProject, Blank())
```

### 7. Responsive Design

| CSS Feature | Power Apps Equivalent | Notes |
|-------------|---------------------|-------|
| Media queries | Responsive layout containers | Use responsive settings on containers |
| Flexbox | Container controls | Arrange controls with flexible layouts |
| Grid layout | Multiple containers | Nest containers for complex layouts |

### 8. Validation and Error Handling

| JavaScript Validation | Power Apps Equivalent | Implementation |
|----------------------|----------------------|----------------|
| `if (!name) alert(...)` | DisplayMode property | Set to DisplayMode.Disabled based on conditions |
| Form validation | Required property | Set Required: true on input controls |
| Custom alerts | Notify() function | Show notifications for errors/success |

**Power Fx Validation Example:**
```powerquery
// Button DisplayMode (disabled if empty)
If(
    IsBlank(TextInput_ProjectName.Text) || IsBlank(TextInput_ProjectRef.Text),
    DisplayMode.Disabled,
    DisplayMode.Edit
)

// Error notification
If(
    IsError(Patch(...)),
    Notify("Error saving project", NotificationType.Error),
    Notify("Project saved successfully", NotificationType.Success)
)
```

### 9. Many-to-Many Relationships Display

| JavaScript Logic | Power Apps Formula | Purpose |
|------------------|-------------------|---------|
| Array mapping for labels | LookUp and Join functions | Display relationship tags |

**Power Fx Relationship Display:**
```powerquery
// Display related outcomes for an indicator
Concat(
    ForAll(
        Filter(IndicatorOutcomes, IndicatorId = ThisItem.Id),
        LookUp(
            Outcomes,
            Id = OutcomeId,
            Char(65 + Index - 1)  // Convert to A, B, C
        )
    ),
    Value,
    ", "
)

// Display related touchpoints for an indicator
Concat(
    ForAll(
        Filter(IndicatorTouchpoints, IndicatorId = ThisItem.Id),
        LookUp(
            Touchpoints,
            Id = TouchpointId,
            "TP" & Index
        )
    ),
    Value,
    ", "
)
```