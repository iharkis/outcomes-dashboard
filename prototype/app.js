class ProjectPlanningApp {
    constructor() {
        this.currentProject = null;
        this.projects = [];
        this.currentEditingItem = null;
        this.filteredProjects = [];
        this.currentPage = 1;
        this.pageSize = 25;
        this.sortField = 'created';
        this.sortDirection = 'desc';
        this.searchTerm = '';
        this.currentPhase = 'plan'; // 'plan', 'create', or 'evaluate'
        this.currentSubpage = 'outcomes'; // 'outcomes', 'touchpoints', 'indicators', 'relationships'
        this.mappingMode = 'indicator'; // 'indicator' or 'matrix'
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.refreshProjectsTable();
    }

    loadData() {
        const savedData = localStorage.getItem('projectPlanningData');
        if (savedData) {
            this.projects = JSON.parse(savedData);
            // Ensure all projects have required arrays
            this.projects.forEach(project => {
                if (!project.outcomes) project.outcomes = [];
                if (!project.touchpoints) project.touchpoints = [];
                if (!project.indicators) project.indicators = [];
                if (!project.decisions) project.decisions = [];
                if (!project.evaluations) project.evaluations = {};
                if (!project.actionItems) project.actionItems = [];
                if (!project.finalReview) project.finalReview = {};
            });
        } else {
            this.projects = [];
        }
    }

    saveData() {
        localStorage.setItem('projectPlanningData', JSON.stringify(this.projects));
    }

    setupEventListeners() {
        // Project management
        document.getElementById('new-project-btn').addEventListener('click', () => this.showNewProjectForm());
        document.getElementById('save-project-btn').addEventListener('click', () => this.saveProject());
        document.getElementById('cancel-project-btn').addEventListener('click', () => this.hideNewProjectForm());

        // Projects table
        document.getElementById('project-search').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('page-size-select').addEventListener('change', (e) => this.handlePageSizeChange(e.target.value));
        document.getElementById('prev-page-btn').addEventListener('click', () => this.previousPage());
        document.getElementById('next-page-btn').addEventListener('click', () => this.nextPage());

        // Table sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', (e) => this.handleSort(e.currentTarget.dataset.sort));
        });

        // Setup workspace event listeners (these elements may not exist on initial load)
        this.setupWorkspaceEventListeners();

        // Review page
        const navReview = document.getElementById('nav-review');
        const saveReviewBtn = document.getElementById('save-review-btn');
        const viewFinalReportBtn = document.getElementById('view-final-report-btn');
        const downloadFinalReportBtn = document.getElementById('download-final-report-btn');

        if (navReview) navReview.addEventListener('click', () => this.navigateToPage('review'));
        if (saveReviewBtn) saveReviewBtn.addEventListener('click', () => this.saveFinalReview());
        if (viewFinalReportBtn) viewFinalReportBtn.addEventListener('click', () => this.viewFinalReport());
        if (downloadFinalReportBtn) downloadFinalReportBtn.addEventListener('click', () => this.downloadFinalReport());
    }

    setupWorkspaceEventListeners() {
        // Helper function to safely add event listener
        const safeAddListener = (id, event, handler) => {
            const element = document.getElementById(id);
            if (element) element.addEventListener(event, handler);
        };

        // View navigation
        safeAddListener('back-to-projects-btn', 'click', () => this.showProjectSelection());

        // Sidebar navigation
        safeAddListener('nav-plan', 'click', () => this.togglePlanSubitems());
        safeAddListener('nav-outcomes', 'click', () => this.navigateToPage('outcomes'));
        safeAddListener('nav-touchpoints', 'click', () => this.navigateToPage('touchpoints'));
        safeAddListener('nav-indicators', 'click', () => this.navigateToPage('indicators'));
        safeAddListener('nav-relationships', 'click', () => this.navigateToPage('relationships'));
        safeAddListener('nav-create', 'click', () => this.navigateToPage('create'));
        safeAddListener('nav-evaluate', 'click', () => this.navigateToPage('evaluate'));

        // Mapping mode toggle
        document.querySelectorAll('input[name="mapping-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.switchMappingMode(e.target.value));
        });

        // Outcomes
        safeAddListener('add-outcome-btn', 'click', () => this.showQuickAddForm('outcome'));
        safeAddListener('save-outcome-btn', 'click', () => this.saveQuickOutcome());
        safeAddListener('cancel-outcome-btn', 'click', () => this.hideQuickAddForm('outcome'));
        safeAddListener('bulk-add-outcomes-btn', 'click', () => this.showBulkAddForm('outcomes'));
        safeAddListener('save-bulk-outcomes-btn', 'click', () => this.saveBulkOutcomes());
        safeAddListener('cancel-bulk-outcomes-btn', 'click', () => this.hideBulkAddForm('outcomes'));

        // Touchpoints
        safeAddListener('add-touchpoint-btn', 'click', () => this.showQuickAddForm('touchpoint'));
        safeAddListener('save-touchpoint-btn', 'click', () => this.saveQuickTouchpoint());
        safeAddListener('cancel-touchpoint-btn', 'click', () => this.hideQuickAddForm('touchpoint'));
        safeAddListener('bulk-add-touchpoints-btn', 'click', () => this.showBulkAddForm('touchpoints'));
        safeAddListener('save-bulk-touchpoints-btn', 'click', () => this.saveBulkTouchpoints());
        safeAddListener('cancel-bulk-touchpoints-btn', 'click', () => this.hideBulkAddForm('touchpoints'));

        // Indicators
        safeAddListener('add-indicator-btn', 'click', () => this.showQuickAddForm('indicator'));
        safeAddListener('save-indicator-btn', 'click', () => this.saveQuickIndicator());
        safeAddListener('cancel-indicator-btn', 'click', () => this.hideQuickAddForm('indicator'));
        safeAddListener('bulk-add-indicators-btn', 'click', () => this.showBulkAddForm('indicators'));
        safeAddListener('save-bulk-indicators-btn', 'click', () => this.saveBulkIndicators());
        safeAddListener('cancel-bulk-indicators-btn', 'click', () => this.hideBulkAddForm('indicators'));

        // Decision log
        safeAddListener('add-decision-btn', 'click', () => this.showAddDecisionForm());
        safeAddListener('save-decision-btn', 'click', () => this.saveDecision());
        safeAddListener('cancel-decision-btn', 'click', () => this.hideAddDecisionForm());
        safeAddListener('export-decisions-btn', 'click', () => this.exportDecisions());

        // Evaluate dashboard
        const evalSelect = document.getElementById('evaluate-touchpoint-select');
        if (evalSelect) evalSelect.addEventListener('change', (e) => this.handleTouchpointSelection(e.target.value));
        safeAddListener('add-action-item-btn', 'click', () => this.showAddActionForm());
        safeAddListener('save-action-btn', 'click', () => this.saveActionItem());
        safeAddListener('cancel-action-btn', 'click', () => this.hideAddActionForm());
        safeAddListener('save-evaluation-btn', 'click', () => this.saveEvaluation());
        safeAddListener('export-evaluations-btn', 'click', () => this.exportEvaluations());

        // Evaluate sub-navigation
        safeAddListener('evaluate-by-touchpoint-btn', 'click', () => this.switchToEvaluateByTouchpoint());
        safeAddListener('view-all-answers-btn', 'click', () => this.switchToViewAllAnswers());

        // Export all data
        safeAddListener('export-all-data-btn', 'click', () => this.exportAllData());
    }

    // Project Management
    showNewProjectForm() {
        document.getElementById('new-project-form').classList.remove('hidden');
        document.getElementById('project-name').focus();
    }

    hideNewProjectForm() {
        document.getElementById('new-project-form').classList.add('hidden');
        document.getElementById('project-name').value = '';
        document.getElementById('project-ref').value = '';
    }

    saveProject() {
        const name = document.getElementById('project-name').value.trim();
        const ref = document.getElementById('project-ref').value.trim();

        if (!name || !ref) {
            alert('Please fill in both project name and reference number.');
            return;
        }

        const project = {
            id: Date.now().toString(),
            name: name,
            reference: ref,
            outcomes: [],
            touchpoints: [],
            indicators: [],
            decisions: [],
            evaluations: {},
            actionItems: [],
            finalReview: {},
            created: new Date().toISOString()
        };

        this.projects.push(project);
        this.saveData();
        this.hideNewProjectForm();
        this.selectProject(project.id);
    }

    // Projects Table Management
    handleSearch(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase();
        this.currentPage = 1;
        this.refreshProjectsTable();
    }

    handleSort(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        this.refreshProjectsTable();
    }

    handlePageSizeChange(pageSize) {
        this.pageSize = parseInt(pageSize);
        this.currentPage = 1;
        this.refreshProjectsTable();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.refreshProjectsTable();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredProjects.length / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.refreshProjectsTable();
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.refreshProjectsTable();
    }

    filterAndSortProjects() {
        // Filter projects
        this.filteredProjects = this.projects.filter(project => {
            if (!this.searchTerm) return true;
            return project.name.toLowerCase().includes(this.searchTerm) ||
                   project.reference.toLowerCase().includes(this.searchTerm);
        });

        // Sort projects
        this.filteredProjects.sort((a, b) => {
            let aValue, bValue;

            switch (this.sortField) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'reference':
                    aValue = a.reference.toLowerCase();
                    bValue = b.reference.toLowerCase();
                    break;
                case 'created':
                    aValue = new Date(a.id);
                    bValue = new Date(b.id);
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    refreshProjectsTable() {
        this.filterAndSortProjects();

        const tableBody = document.getElementById('projects-table-body');
        const emptyState = document.getElementById('projects-empty-state');
        const table = document.getElementById('projects-table');

        // Show/hide empty state
        if (this.filteredProjects.length === 0) {
            table.style.display = 'none';
            emptyState.classList.remove('hidden');
            this.updatePaginationInfo();
            return;
        } else {
            table.style.display = 'table';
            emptyState.classList.add('hidden');
        }

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageProjects = this.filteredProjects.slice(startIndex, endIndex);

        // Clear table body
        tableBody.innerHTML = '';

        // Add project rows
        pageProjects.forEach(project => {
            const row = this.createProjectRow(project);
            tableBody.appendChild(row);
        });

        // Update sort arrows
        this.updateSortArrows();

        // Update pagination
        this.updatePaginationInfo();
        this.updatePaginationControls();
    }

    createProjectRow(project) {
        const row = document.createElement('tr');
        if (this.currentProject && this.currentProject.id === project.id) {
            row.classList.add('selected');
        }

        const outcomeCount = project.outcomes ? project.outcomes.length : 0;
        const touchpointCount = project.touchpoints ? project.touchpoints.length : 0;
        const indicatorCount = project.indicators ? project.indicators.length : 0;
        const createdDate = new Date(parseInt(project.id)).toLocaleDateString();

        row.innerHTML = `
            <td>${project.name}</td>
            <td>${project.reference}</td>
            <td>${createdDate}</td>
            <td>
                <span class="stat-badge ${outcomeCount > 0 ? 'has-items' : ''}">${outcomeCount}</span>
            </td>
            <td>
                <span class="stat-badge ${touchpointCount > 0 ? 'has-items' : ''}">${touchpointCount}</span>
            </td>
            <td>
                <span class="stat-badge ${indicatorCount > 0 ? 'has-items' : ''}">${indicatorCount}</span>
            </td>
            <td>
                <button class="btn btn-small btn-primary" onclick="app.selectProject('${project.id}')">
                    ${this.currentProject && this.currentProject.id === project.id ? 'Selected' : 'Select'}
                </button>
            </td>
        `;

        return row;
    }

    updateSortArrows() {
        document.querySelectorAll('.sort-arrow').forEach(arrow => {
            arrow.className = 'sort-arrow';
        });

        const currentHeader = document.querySelector(`[data-sort="${this.sortField}"] .sort-arrow`);
        if (currentHeader) {
            currentHeader.classList.add(this.sortDirection);
        }
    }

    updatePaginationInfo() {
        const totalProjects = this.filteredProjects.length;
        const startIndex = (this.currentPage - 1) * this.pageSize + 1;
        const endIndex = Math.min(this.currentPage * this.pageSize, totalProjects);

        let infoText;
        if (totalProjects === 0) {
            infoText = 'Showing 0 of 0 projects';
        } else {
            infoText = `Showing ${startIndex}-${endIndex} of ${totalProjects} projects`;
        }

        document.getElementById('pagination-info').textContent = infoText;
    }

    updatePaginationControls() {
        const totalPages = Math.ceil(this.filteredProjects.length / this.pageSize);

        // Update prev/next buttons
        document.getElementById('prev-page-btn').disabled = this.currentPage <= 1;
        document.getElementById('next-page-btn').disabled = this.currentPage >= totalPages;

        // Update page numbers
        const pageNumbers = document.getElementById('page-numbers');
        pageNumbers.innerHTML = '';

        if (totalPages <= 1) return;

        // Calculate page range to show
        const maxPages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(totalPages, startPage + maxPages - 1);

        if (endPage - startPage < maxPages - 1) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }

        // First page
        if (startPage > 1) {
            pageNumbers.appendChild(this.createPageButton(1));
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'page-ellipsis';
                pageNumbers.appendChild(ellipsis);
            }
        }

        // Page range
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.appendChild(this.createPageButton(i));
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'page-ellipsis';
                pageNumbers.appendChild(ellipsis);
            }
            pageNumbers.appendChild(this.createPageButton(totalPages));
        }
    }

    createPageButton(pageNumber) {
        const button = document.createElement('button');
        button.textContent = pageNumber;
        button.className = `page-number ${pageNumber === this.currentPage ? 'active' : ''}`;
        button.onclick = () => this.goToPage(pageNumber);
        return button;
    }

    selectProject(projectId) {
        if (!projectId) {
            this.showProjectSelection();
            this.currentProject = null;
            return;
        }

        this.currentProject = this.projects.find(p => p.id === projectId);
        if (this.currentProject) {
            this.showProjectWorkspace();
        }
    }

    showProjectSelection() {
        document.getElementById('project-selection-view').classList.remove('hidden');
        document.getElementById('project-workspace').classList.add('hidden');
        this.currentProject = null;
        this.currentPhase = 'data-entry';
        this.refreshProjectsTable();
    }

    showProjectWorkspace() {
        try {
            document.getElementById('project-selection-view').classList.add('hidden');
            document.getElementById('project-workspace').classList.remove('hidden');
            document.getElementById('current-project-name').textContent = this.currentProject.name;
            document.getElementById('current-project-ref').textContent = `Project No: ${this.currentProject.reference}`;
            this.currentPhase = 'plan';
            this.currentSubpage = 'outcomes';
            // Expand Plan subitems by default and navigate to Outcomes
            const subitems = document.querySelector('.nav-subitems');
            if (subitems) {
                subitems.classList.add('expanded');
            }
            this.navigateToPage('outcomes');
        } catch (error) {
            console.error('Error in showProjectWorkspace:', error);
            alert('Error loading project workspace: ' + error.message);
        }
    }

    // Navigation Management
    togglePlanSubitems() {
        const subitems = document.querySelector('.nav-subitems');
        subitems.classList.toggle('expanded');

        // If collapsing, navigate to first subitem to ensure consistency
        if (subitems.classList.contains('expanded') && this.currentPhase === 'plan') {
            // Don't navigate if already on a plan subpage
        }
    }

    navigateToPage(pageName) {
        // Hide all pages
        const pages = ['outcomes', 'touchpoints', 'indicators', 'relationships', 'create', 'evaluate', 'review'];
        pages.forEach(page => {
            const pageElement = document.getElementById(`${page}-page`);
            if (pageElement) {
                pageElement.classList.add('hidden');
            }
        });

        // Show the selected page
        const selectedPage = document.getElementById(`${pageName}-page`);
        if (selectedPage) {
            selectedPage.classList.remove('hidden');
        }

        // Update current phase and subpage
        if (['outcomes', 'touchpoints', 'indicators', 'relationships'].includes(pageName)) {
            this.currentPhase = 'plan';
            this.currentSubpage = pageName;

            // Expand Plan subitems
            const subitems = document.querySelector('.nav-subitems');
            if (subitems) {
                subitems.classList.add('expanded');
            }
        } else {
            this.currentPhase = pageName;
        }

        // Update navigation highlighting
        this.updateNavigation();

        // Refresh content based on the page
        this.refreshCurrentPage(pageName);
    }

    updateNavigation() {
        // Clear all active states
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.nav-subitem').forEach(item => item.classList.remove('active'));

        // Set active state based on current page
        if (this.currentPhase === 'plan') {
            const navPlan = document.getElementById('nav-plan');
            const navSubpage = document.getElementById(`nav-${this.currentSubpage}`);
            if (navPlan) navPlan.classList.add('active');
            if (navSubpage) navSubpage.classList.add('active');
        } else if (this.currentPhase === 'create') {
            const navCreate = document.getElementById('nav-create');
            if (navCreate) navCreate.classList.add('active');
        } else if (this.currentPhase === 'evaluate') {
            const navEvaluate = document.getElementById('nav-evaluate');
            if (navEvaluate) navEvaluate.classList.add('active');
        } else if (this.currentPhase === 'review') {
            const navReview = document.getElementById('nav-review');
            if (navReview) navReview.classList.add('active');
        }
    }

    refreshCurrentPage(pageName) {
        switch(pageName) {
            case 'outcomes':
                this.refreshOutcomes();
                break;
            case 'touchpoints':
                this.refreshTouchpoints();
                break;
            case 'indicators':
                this.refreshIndicators();
                break;
            case 'relationships':
                this.refreshMappingPhase();
                break;
            case 'create':
                this.refreshDecisionLog();
                break;
            case 'evaluate':
                this.refreshEvaluateDashboard();
                this.switchToEvaluateByTouchpoint();
                break;
            case 'review':
                this.refreshReviewPage();
                break;
        }
    }

    refreshDataEntryPhase() {
        // Refresh the current subpage within Plan
        if (this.currentPhase === 'plan') {
            this.refreshCurrentPage(this.currentSubpage);
        }
    }

    switchMappingMode(mode) {
        this.mappingMode = mode;
        if (mode === 'indicator') {
            document.getElementById('indicator-mapping-view').classList.remove('hidden');
            document.getElementById('matrix-mapping-view').classList.add('hidden');
        } else {
            document.getElementById('indicator-mapping-view').classList.add('hidden');
            document.getElementById('matrix-mapping-view').classList.remove('hidden');
        }
        this.refreshMappingPhase();
    }

    refreshMappingPhase() {
        if (this.mappingMode === 'indicator') {
            this.refreshIndicatorMappingView();
        } else {
            this.refreshMatrixView();
        }
    }

    // Evaluate sub-navigation methods
    switchToEvaluateByTouchpoint() {
        // Update navigation buttons
        document.getElementById('evaluate-by-touchpoint-btn').classList.add('active');
        document.getElementById('view-all-answers-btn').classList.remove('active');

        // Show/hide views
        document.getElementById('evaluate-by-touchpoint-view').classList.remove('hidden');
        document.getElementById('view-all-answers-view').classList.add('hidden');

        // Refresh the touchpoint evaluation interface
        this.refreshEvaluateDashboard();
        this.refreshEvaluationOverview();
    }

    switchToViewAllAnswers() {
        // Update navigation buttons
        document.getElementById('evaluate-by-touchpoint-btn').classList.remove('active');
        document.getElementById('view-all-answers-btn').classList.add('active');

        // Show/hide views
        document.getElementById('evaluate-by-touchpoint-view').classList.add('hidden');
        document.getElementById('view-all-answers-view').classList.remove('hidden');

        // Refresh the answers view
        this.refreshAllAnswersView();
    }

    refreshAllAnswersView() {
        const container = document.getElementById('all-answers-content');
        const emptyState = document.getElementById('no-evaluations-state');

        if (!container) return;

        if (!this.currentProject || !this.currentProject.touchpoints || this.currentProject.touchpoints.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        // Check if there are any evaluations
        const hasEvaluations = this.currentProject.evaluations && Object.keys(this.currentProject.evaluations).length > 0;

        if (!hasEvaluations) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');
        let html = '';

        this.currentProject.touchpoints.forEach((touchpoint, index) => {
            const tpNumber = `TP${index + 1}`;
            const evaluation = this.currentProject.evaluations[touchpoint.id];

            // Skip if no evaluation for this touchpoint
            if (!evaluation) return;

            html += `
                <div class="touchpoint-answers-card">
                    <div class="touchpoint-header">
                        <h3>${tpNumber}: ${touchpoint.heading}</h3>
                        <p class="touchpoint-description">${touchpoint.description || ''}</p>
                    </div>
            `;

            // Decision making evaluation
            if (evaluation.decisionMakingEvaluation) {
                html += `
                    <div class="decision-making-section">
                        <h4>How have outcomes informed decision making?</h4>
                        <p>${evaluation.decisionMakingEvaluation}</p>
                    </div>
                `;
            }

            // Outcome progress
            if (evaluation.outcomeProgress && Object.keys(evaluation.outcomeProgress).length > 0) {
                html += `
                    <div class="outcomes-answers">
                        <h4>Outcome Progress</h4>
                `;

                this.currentProject.outcomes.forEach((outcome, outcomeIndex) => {
                    const letter = String.fromCharCode(65 + outcomeIndex);
                    const progress = evaluation.outcomeProgress[outcome.id];

                    if (progress && (progress.progress || progress.justification || progress.trend)) {
                        html += `
                            <div class="outcome-group">
                                <h5>Outcome ${letter}: ${outcome.heading}</h5>
                                <div class="outcome-progress-details">
                                    ${progress.progress ? `<p><strong>Progress:</strong> ${progress.progress}</p>` : ''}
                                    ${progress.trend ? `<p><strong>Trend:</strong> ${progress.trend}</p>` : ''}
                                    ${progress.justification ? `<p><strong>Justification:</strong> ${progress.justification}</p>` : ''}
                                </div>
                            </div>
                        `;
                    }
                });

                html += `
                    </div>
                `;
            }

            // Action items for this touchpoint
            const actionItems = evaluation.actionItems || [];

            if (actionItems.length > 0) {
                html += `
                    <div class="action-items-section">
                        <h4>Action Items</h4>
                        <div class="action-items-list">
                `;

                actionItems.forEach(item => {
                    html += `
                        <div class="action-item priority-${item.priority.toLowerCase()}">
                            <div class="action-header">
                                <span class="priority-badge">${item.priority} Priority</span>
                                ${item.dueDate ? `<span class="due-date">Due: ${item.dueDate}</span>` : ''}
                            </div>
                            <div class="action-description">${item.description}</div>
                        </div>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            }

            html += `
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Quick Add Forms
    showQuickAddForm(type) {
        document.getElementById(`add-${type}-form`).classList.remove('hidden');
        document.getElementById(`${type === 'indicator' ? 'indicator-description' : type + '-heading'}`).focus();
    }

    hideQuickAddForm(type) {
        document.getElementById(`add-${type}-form`).classList.add('hidden');
        if (type === 'indicator') {
            document.getElementById('indicator-description').value = '';
            document.getElementById('indicator-baseline').value = '';
        } else if (type === 'outcome') {
            document.getElementById('outcome-heading').value = '';
        } else {
            document.getElementById(`${type}-heading`).value = '';
            document.getElementById(`${type}-description`).value = '';
        }
    }

    // Bulk Add Forms
    showBulkAddForm(type) {
        document.getElementById(`bulk-${type}-form`).classList.remove('hidden');
        document.getElementById(`bulk-${type}-text`).focus();
    }

    hideBulkAddForm(type) {
        document.getElementById(`bulk-${type}-form`).classList.add('hidden');
        document.getElementById(`bulk-${type}-text`).value = '';
    }

    // Quick Add Methods
    saveQuickOutcome() {
        const heading = document.getElementById('outcome-heading').value.trim();

        if (!heading) {
            alert('Please enter an outcome heading.');
            return;
        }

        const outcome = {
            id: Date.now().toString(),
            heading: heading,
            description: '' // No description needed for outcomes
        };

        this.currentProject.outcomes.push(outcome);
        this.saveData();
        this.refreshOutcomes();
        this.hideQuickAddForm('outcome');
    }

    saveQuickTouchpoint() {
        const heading = document.getElementById('touchpoint-heading').value.trim();
        const description = document.getElementById('touchpoint-description').value.trim();

        if (!heading) {
            alert('Please enter a touchpoint heading.');
            return;
        }

        const touchpoint = {
            id: Date.now().toString(),
            heading: heading,
            description: description
        };

        this.currentProject.touchpoints.push(touchpoint);
        this.saveData();
        this.refreshTouchpoints();
        this.hideQuickAddForm('touchpoint');
    }

    saveQuickIndicator() {
        const description = document.getElementById('indicator-description').value.trim();
        const baseline = document.getElementById('indicator-baseline').value.trim();

        if (!description) {
            alert('Please enter an indicator description.');
            return;
        }

        const indicator = {
            id: Date.now().toString(),
            description: description,
            baseline: baseline,
            outcomes: [],
            touchpoints: []
        };

        this.currentProject.indicators.push(indicator);
        this.saveData();
        this.refreshIndicators();
        this.hideQuickAddForm('indicator');
    }

    // Bulk Add Methods
    saveBulkOutcomes() {
        const text = document.getElementById('bulk-outcomes-text').value.trim();
        if (!text) {
            alert('Please enter some outcomes.');
            return;
        }

        const lines = text.split('\n').filter(line => line.trim());
        let addedCount = 0;

        lines.forEach(line => {
            const heading = line.trim();

            if (heading) {
                const outcome = {
                    id: (Date.now() + addedCount).toString(),
                    heading: heading,
                    description: '' // No description needed for outcomes
                };
                this.currentProject.outcomes.push(outcome);
                addedCount++;
            }
        });

        this.saveData();
        this.refreshOutcomes();
        this.hideBulkAddForm('outcomes');
        alert(`Added ${addedCount} outcomes.`);
    }

    saveBulkTouchpoints() {
        const text = document.getElementById('bulk-touchpoints-text').value.trim();
        if (!text) {
            alert('Please enter some touchpoints.');
            return;
        }

        const lines = text.split('\n').filter(line => line.trim());
        let addedCount = 0;

        lines.forEach(line => {
            const parts = line.split('|').map(part => part.trim());
            const heading = parts[0];
            const description = parts[1] || '';

            if (heading) {
                const touchpoint = {
                    id: (Date.now() + addedCount).toString(),
                    heading: heading,
                    description: description
                };
                this.currentProject.touchpoints.push(touchpoint);
                addedCount++;
            }
        });

        this.saveData();
        this.refreshTouchpoints();
        this.hideBulkAddForm('touchpoints');
        alert(`Added ${addedCount} touchpoints.`);
    }

    saveBulkIndicators() {
        const text = document.getElementById('bulk-indicators-text').value.trim();
        if (!text) {
            alert('Please enter some indicators.');
            return;
        }

        const lines = text.split('\n').filter(line => line.trim());
        let addedCount = 0;

        lines.forEach(line => {
            const parts = line.split('|').map(part => part.trim());
            const description = parts[0];
            const baseline = parts[1] || '';

            if (description) {
                const indicator = {
                    id: (Date.now() + addedCount).toString(),
                    description: description,
                    baseline: baseline,
                    outcomes: [],
                    touchpoints: []
                };
                this.currentProject.indicators.push(indicator);
                addedCount++;
            }
        });

        this.saveData();
        this.refreshIndicators();
        this.hideBulkAddForm('indicators');
        alert(`Added ${addedCount} indicators.`);
    }

    refreshOutcomes() {
        const container = document.getElementById('outcomes-list');
        container.innerHTML = '';

        this.currentProject.outcomes.forEach((outcome, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, etc.
            const card = this.createSimpleCard(outcome, letter, 'outcome', index);
            container.appendChild(card);
        });
    }

    refreshTouchpoints() {
        const container = document.getElementById('touchpoints-list');
        container.innerHTML = '';

        this.currentProject.touchpoints.forEach((touchpoint, index) => {
            const number = `TP${index + 1}`;
            const card = this.createSimpleCard(touchpoint, number, 'touchpoint', index);
            container.appendChild(card);
        });
    }

    refreshIndicators() {
        const container = document.getElementById('indicators-list');
        container.innerHTML = '';

        this.currentProject.indicators.forEach((indicator, index) => {
            const card = this.createIndicatorCard(indicator, index);
            container.appendChild(card);
        });
    }

    createSimpleCard(item, label, type, index) {
        const card = document.createElement('div');
        card.className = 'item-card';

        const showDescription = type !== 'outcome' && item.description;
        const editFields = type === 'outcome' ?
            `<input type="text" id="edit-${type}-heading-${index}" value="${item.heading}" placeholder="Heading">` :
            `<input type="text" id="edit-${type}-heading-${index}" value="${item.heading}" placeholder="Heading">
             <input type="text" id="edit-${type}-description-${index}" value="${item.description || ''}" placeholder="Description">`;

        card.innerHTML = `
            <div class="item-header">
                <span class="item-label">${label}</span>
                <div class="item-content">
                    <div class="item-title">${item.heading}</div>
                    ${showDescription ? `<div class="item-description">${item.description}</div>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn btn-small btn-secondary" onclick="app.editItem('${type}', ${index})">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="app.deleteItem('${type}', ${index})">Delete</button>
                </div>
            </div>
            <div id="edit-${type}-${index}" class="edit-form hidden">
                <div class="form-row">
                    ${editFields}
                    <button class="btn btn-success btn-small" onclick="app.updateItem('${type}', ${index})">Update</button>
                    <button class="btn btn-secondary btn-small" onclick="app.cancelEditItem('${type}', ${index})">Cancel</button>
                </div>
            </div>
        `;
        return card;
    }

    createIndicatorCard(indicator, index) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-header">
                <div class="item-content">
                    <div class="item-title">${indicator.description}</div>
                    ${indicator.baseline ? `<div class="item-description">Baseline: ${indicator.baseline}</div>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn btn-small btn-secondary" onclick="app.editItem('indicator', ${index})">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="app.deleteItem('indicator', ${index})">Delete</button>
                </div>
            </div>
            <div id="edit-indicator-${index}" class="edit-form hidden">
                <div class="form-row">
                    <input type="text" id="edit-indicator-description-${index}" value="${indicator.description}" placeholder="Description">
                    <input type="text" id="edit-indicator-baseline-${index}" value="${indicator.baseline || ''}" placeholder="Baseline">
                    <button class="btn btn-success btn-small" onclick="app.updateItem('indicator', ${index})">Update</button>
                    <button class="btn btn-secondary btn-small" onclick="app.cancelEditItem('indicator', ${index})">Cancel</button>
                </div>
            </div>
        `;
        return card;
    }

    editItem(type, index) {
        document.getElementById(`edit-${type}-${index}`).classList.remove('hidden');
    }

    cancelEditItem(type, index) {
        document.getElementById(`edit-${type}-${index}`).classList.add('hidden');
    }

    updateItem(type, index) {
        if (type === 'indicator') {
            const description = document.getElementById(`edit-indicator-description-${index}`).value.trim();
            const baseline = document.getElementById(`edit-indicator-baseline-${index}`).value.trim();

            if (!description) {
                alert('Please enter an indicator description.');
                return;
            }

            this.currentProject.indicators[index].description = description;
            this.currentProject.indicators[index].baseline = baseline;
        } else {
            const heading = document.getElementById(`edit-${type}-heading-${index}`).value.trim();

            if (!heading) {
                alert(`Please enter a ${type} heading.`);
                return;
            }

            this.currentProject[type === 'outcome' ? 'outcomes' : 'touchpoints'][index].heading = heading;

            if (type !== 'outcome') {
                const description = document.getElementById(`edit-${type}-description-${index}`).value.trim();
                this.currentProject[type === 'outcome' ? 'outcomes' : 'touchpoints'][index].description = description;
            }
        }

        this.saveData();
        // Refresh appropriate section
        if (type === 'indicator') {
            this.refreshIndicators();
        } else if (type === 'outcome') {
            this.refreshOutcomes();
        } else {
            this.refreshTouchpoints();
        }
        this.refreshMappingPhase();
    }

    deleteItem(type, index) {
        const itemName = type === 'indicator' ? 'indicator' : type;
        if (confirm(`Are you sure you want to delete this ${itemName}?`)) {
            const collection = type === 'outcome' ? 'outcomes' :
                             type === 'touchpoint' ? 'touchpoints' : 'indicators';

            const itemId = this.currentProject[collection][index].id;
            this.currentProject[collection].splice(index, 1);

            // Remove references from indicators if deleting outcomes or touchpoints
            if (type === 'outcome') {
                this.currentProject.indicators.forEach(indicator => {
                    indicator.outcomes = indicator.outcomes.filter(id => id !== itemId);
                });
            } else if (type === 'touchpoint') {
                this.currentProject.indicators.forEach(indicator => {
                    indicator.touchpoints = indicator.touchpoints.filter(id => id !== itemId);
                });
            }

            this.saveData();
            // Refresh appropriate section
            if (type === 'indicator') {
                this.refreshIndicators();
            } else if (type === 'outcome') {
                this.refreshOutcomes();
            } else {
                this.refreshTouchpoints();
            }
            this.refreshMappingPhase();
        }
    }

    // Relationship Mapping Methods
    refreshIndicatorMappingView() {
        const container = document.getElementById('indicator-mapping-list');
        container.innerHTML = '';

        this.currentProject.indicators.forEach((indicator, index) => {
            const card = this.createIndicatorMappingCard(indicator, index);
            container.appendChild(card);
        });
    }

    createIndicatorMappingCard(indicator, index) {
        const card = document.createElement('div');
        card.className = 'indicator-mapping-card';

        card.innerHTML = `
            <div class="indicator-mapping-header">
                <div class="indicator-title">${indicator.description}</div>
                ${indicator.baseline ? `<div class="indicator-baseline">Baseline: ${indicator.baseline}</div>` : ''}
            </div>
            <div class="mapping-sections">
                <div class="mapping-section">
                    <h5>Related Outcomes</h5>
                    <div class="relationship-checkboxes" id="mapping-outcomes-${index}">
                        ${this.createOutcomeCheckboxes(indicator, index)}
                    </div>
                </div>
                <div class="mapping-section">
                    <h5>Appropriate Touchpoints to measure</h5>
                    <div class="relationship-checkboxes" id="mapping-touchpoints-${index}">
                        ${this.createTouchpointCheckboxes(indicator, index)}
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    createOutcomeCheckboxes(indicator, indicatorIndex) {
        return this.currentProject.outcomes.map((outcome, outcomeIndex) => {
            const letter = String.fromCharCode(65 + outcomeIndex);
            const isChecked = indicator.outcomes.includes(outcome.id);
            return `
                <div class="relationship-checkbox">
                    <input type="checkbox" id="outcome-mapping-${indicatorIndex}-${outcome.id}"
                           value="${outcome.id}" ${isChecked ? 'checked' : ''}
                           onchange="app.updateIndicatorRelationship(${indicatorIndex}, 'outcomes', '${outcome.id}', this.checked)">
                    <label for="outcome-mapping-${indicatorIndex}-${outcome.id}">${letter}: ${outcome.heading}</label>
                </div>
            `;
        }).join('');
    }

    createTouchpointCheckboxes(indicator, indicatorIndex) {
        return this.currentProject.touchpoints.map((touchpoint, touchpointIndex) => {
            const number = `TP${touchpointIndex + 1}`;
            const isChecked = indicator.touchpoints.includes(touchpoint.id);
            return `
                <div class="relationship-checkbox">
                    <input type="checkbox" id="touchpoint-mapping-${indicatorIndex}-${touchpoint.id}"
                           value="${touchpoint.id}" ${isChecked ? 'checked' : ''}
                           onchange="app.updateIndicatorRelationship(${indicatorIndex}, 'touchpoints', '${touchpoint.id}', this.checked)">
                    <label for="touchpoint-mapping-${indicatorIndex}-${touchpoint.id}">${number}: ${touchpoint.heading}</label>
                </div>
            `;
        }).join('');
    }

    updateIndicatorRelationship(indicatorIndex, type, itemId, isChecked) {
        const indicator = this.currentProject.indicators[indicatorIndex];

        if (isChecked) {
            if (!indicator[type].includes(itemId)) {
                indicator[type].push(itemId);
            }
        } else {
            indicator[type] = indicator[type].filter(id => id !== itemId);
        }

        this.saveData();
    }

    refreshMatrixView() {
        const table = document.getElementById('relationship-matrix');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');

        // Clear existing content
        thead.innerHTML = '';
        tbody.innerHTML = '';

        const outcomeCount = this.currentProject.outcomes.length;
        const touchpointCount = this.currentProject.touchpoints.length;

        // Create section header row
        const sectionHeaderRow = document.createElement('tr');
        sectionHeaderRow.innerHTML = `
            <th rowspan="2">Indicators</th>
            <th colspan="${outcomeCount}" class="matrix-section-header outcomes-section">Outcomes</th>
            <th colspan="${touchpointCount}" class="matrix-section-header touchpoints-section">Touchpoints</th>
        `;
        thead.appendChild(sectionHeaderRow);

        // Create column header row
        const columnHeaderRow = document.createElement('tr');

        // Add outcome headers
        this.currentProject.outcomes.forEach((outcome, index) => {
            const th = document.createElement('th');
            th.textContent = this.truncateText(outcome.heading, 15);
            th.title = outcome.heading; // Full text on hover
            th.style.fontSize = '11px';
            th.style.lineHeight = '1.2';
            th.className = 'outcomes-column';
            // Add section divider on last outcome column
            if (index === this.currentProject.outcomes.length - 1) {
                th.classList.add('section-divider');
            }
            columnHeaderRow.appendChild(th);
        });

        // Add touchpoint headers
        this.currentProject.touchpoints.forEach((touchpoint, index) => {
            const th = document.createElement('th');
            th.textContent = this.truncateText(touchpoint.heading, 15);
            th.title = touchpoint.heading; // Full text on hover
            th.style.fontSize = '11px';
            th.style.lineHeight = '1.2';
            th.className = 'touchpoints-column';
            columnHeaderRow.appendChild(th);
        });

        thead.appendChild(columnHeaderRow);

        // Add indicator rows
        this.currentProject.indicators.forEach((indicator, indicatorIndex) => {
            const row = document.createElement('tr');

            // Indicator name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = this.truncateText(indicator.description, 40);
            nameCell.title = indicator.description; // Full text on hover
            nameCell.style.textAlign = 'left';
            row.appendChild(nameCell);

            // Outcome checkboxes
            this.currentProject.outcomes.forEach((outcome, outcomeIndex) => {
                const cell = document.createElement('td');
                cell.className = 'outcomes-column';
                // Add section divider on last outcome column
                if (outcomeIndex === this.currentProject.outcomes.length - 1) {
                    cell.classList.add('section-divider');
                }
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'matrix-checkbox';
                checkbox.checked = indicator.outcomes.includes(outcome.id);
                checkbox.onchange = () => this.updateIndicatorRelationship(indicatorIndex, 'outcomes', outcome.id, checkbox.checked);
                cell.appendChild(checkbox);
                row.appendChild(cell);
            });

            // Touchpoint checkboxes
            this.currentProject.touchpoints.forEach(touchpoint => {
                const cell = document.createElement('td');
                cell.className = 'touchpoints-column';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'matrix-checkbox';
                checkbox.checked = indicator.touchpoints.includes(touchpoint.id);
                checkbox.onchange = () => this.updateIndicatorRelationship(indicatorIndex, 'touchpoints', touchpoint.id, checkbox.checked);
                cell.appendChild(checkbox);
                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });
    }

    // Decision Log Methods
    refreshDecisionLog() {
        // Initialize decisions array if not exists
        if (!this.currentProject.decisions) {
            this.currentProject.decisions = [];
        }

        this.refreshDecisionTable();
        this.refreshOutcomeImpacts();
    }

    refreshDecisionTable() {
        const table = document.getElementById('decision-log-table');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        const emptyState = document.getElementById('decisions-empty-state');

        // Clear existing content
        thead.innerHTML = '';
        tbody.innerHTML = '';

        // Create header row
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th class="ref-col">Ref No</th>
            <th class="date-col">Date</th>
            <th class="topic-col">Topic</th>
            <th class="status-col">Status</th>
            <th>Project Decision</th>
            <th>Decision Justification</th>
            <th>Further Actions</th>
            <th>Impact on Outcomes</th>
        `;

        // Add outcome columns
        this.currentProject.outcomes.forEach((outcome, index) => {
            const letter = String.fromCharCode(65 + index);
            const th = document.createElement('th');
            th.className = 'outcome-col';
            th.textContent = letter;
            th.title = outcome.heading;
            headerRow.appendChild(th);
        });

        // Add actions column
        const actionsHeader = document.createElement('th');
        actionsHeader.className = 'actions-col';
        actionsHeader.textContent = 'Actions';
        headerRow.appendChild(actionsHeader);

        thead.appendChild(headerRow);

        // Show/hide empty state
        if (this.currentProject.decisions.length === 0) {
            emptyState.classList.remove('hidden');
            table.style.display = 'none';
        } else {
            emptyState.classList.add('hidden');
            table.style.display = 'table';

            // Add decision rows
            this.currentProject.decisions.forEach((decision, index) => {
                const row = this.createDecisionRow(decision, index);
                tbody.appendChild(row);
            });
        }
    }

    createDecisionRow(decision, index) {
        const row = document.createElement('tr');

        // Basic columns
        row.innerHTML = `
            <td class="ref-col">${decision.refNo}</td>
            <td class="date-col">${new Date(decision.date).toLocaleDateString()}</td>
            <td class="topic-col">${decision.topic}</td>
            <td class="status-col">
                <span class="status-badge status-${decision.status.toLowerCase()}">${decision.status}</span>
            </td>
            <td>${this.truncateText(decision.description, 100)}</td>
            <td>${this.truncateText(decision.justification, 100)}</td>
            <td>${this.truncateText(decision.actions, 100)}</td>
            <td>${this.truncateText(decision.impact, 100)}</td>
        `;

        // Add outcome impact columns
        this.currentProject.outcomes.forEach((outcome) => {
            const cell = document.createElement('td');
            cell.className = 'outcome-col';
            const impact = decision.outcomeImpacts[outcome.id] || 'unknown';
            let impactClass = impact.toLowerCase().replace(/\s+/g, '-').replace("don't-know", "unknown").replace("staying-stable", "stable");
            cell.innerHTML = `<span class="impact-badge impact-${impactClass}">${impact}</span>`;
            row.appendChild(cell);
        });

        // Add actions column
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions-col';
        actionsCell.innerHTML = `
            <button class="btn btn-small btn-secondary" onclick="app.editDecision(${index})">Edit</button>
            <button class="btn btn-small btn-danger" onclick="app.deleteDecision(${index})">Delete</button>
        `;
        row.appendChild(actionsCell);

        return row;
    }

    refreshOutcomeImpacts() {
        const container = document.getElementById('outcome-impacts-list');
        container.innerHTML = '';

        this.currentProject.outcomes.forEach((outcome, index) => {
            const letter = String.fromCharCode(65 + index);
            const impactItem = document.createElement('div');
            impactItem.className = 'outcome-impact-item';
            impactItem.innerHTML = `
                <label>${letter}: ${outcome.heading}</label>
                <select id="outcome-impact-${outcome.id}">
                    <option value="">Select impact</option>
                    <option value="improving">Improving</option>
                    <option value="declining">Declining</option>
                    <option value="staying stable">Staying stable</option>
                    <option value="don't know">Don't know</option>
                </select>
            `;
            container.appendChild(impactItem);
        });
    }

    showAddDecisionForm() {
        // Set today's date as default
        document.getElementById('decision-date').value = new Date().toISOString().split('T')[0];

        // Refresh outcome impacts
        this.refreshOutcomeImpacts();

        // Show form
        document.getElementById('add-decision-form').classList.remove('hidden');
        document.getElementById('decision-ref').focus();
    }

    hideAddDecisionForm() {
        document.getElementById('add-decision-form').classList.add('hidden');

        // Clear form
        document.getElementById('decision-ref').value = '';
        document.getElementById('decision-date').value = '';
        document.getElementById('decision-topic').value = '';
        document.getElementById('decision-status').value = '';
        document.getElementById('decision-description').value = '';
        document.getElementById('decision-justification').value = '';
        document.getElementById('decision-actions').value = '';
        document.getElementById('decision-impact').value = '';
    }

    saveDecision() {
        const refNo = document.getElementById('decision-ref').value.trim();
        const date = document.getElementById('decision-date').value;
        const topic = document.getElementById('decision-topic').value.trim();
        const status = document.getElementById('decision-status').value;
        const description = document.getElementById('decision-description').value.trim();
        const justification = document.getElementById('decision-justification').value.trim();
        const actions = document.getElementById('decision-actions').value.trim();
        const impact = document.getElementById('decision-impact').value.trim();

        if (!refNo || !date || !description) {
            alert('Please fill in Ref No, Date, and Project Decision fields.');
            return;
        }

        // Collect outcome impacts
        const outcomeImpacts = {};
        this.currentProject.outcomes.forEach(outcome => {
            const impactSelect = document.getElementById(`outcome-impact-${outcome.id}`);
            outcomeImpacts[outcome.id] = impactSelect.value || 'don\'t know';
        });

        const decision = {
            id: Date.now().toString(),
            refNo: refNo,
            date: date,
            topic: topic,
            status: status,
            description: description,
            justification: justification,
            actions: actions,
            impact: impact,
            outcomeImpacts: outcomeImpacts
        };

        this.currentProject.decisions.push(decision);
        this.saveData();
        this.refreshDecisionLog();
        this.hideAddDecisionForm();
    }

    editDecision(index) {
        // TODO: Implement edit decision
        console.log('Edit decision', index);
    }

    deleteDecision(index) {
        if (confirm('Are you sure you want to delete this decision?')) {
            this.currentProject.decisions.splice(index, 1);
            this.saveData();
            this.refreshDecisionLog();
        }
    }

    exportDecisions() {
        if (this.currentProject.decisions.length === 0) {
            alert('No decisions to export.');
            return;
        }

        // Create CSV headers
        let headers = ['Ref No', 'Date', 'Topic', 'Status', 'Project Decision', 'Decision Justification', 'Further Actions', 'Impact on Outcomes'];

        // Add outcome headers
        this.currentProject.outcomes.forEach((outcome, index) => {
            const letter = String.fromCharCode(65 + index);
            headers.push(`${letter}: ${outcome.heading}`);
        });

        let csvContent = headers.join(',') + '\n';

        // Add decision rows
        this.currentProject.decisions.forEach(decision => {
            let row = [
                `"${decision.refNo}"`,
                `"${decision.date}"`,
                `"${decision.topic}"`,
                `"${decision.status}"`,
                `"${decision.description.replace(/"/g, '""')}"`,
                `"${decision.justification.replace(/"/g, '""')}"`,
                `"${decision.actions.replace(/"/g, '""')}"`,
                `"${decision.impact.replace(/"/g, '""')}"`
            ];

            // Add outcome impacts
            this.currentProject.outcomes.forEach(outcome => {
                row.push(`"${decision.outcomeImpacts[outcome.id] || 'don\'t know'}"`);
            });

            csvContent += row.join(',') + '\n';
        });

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentProject.name}-decisions.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // ================================
    // Evaluate Dashboard Methods
    // ================================

    refreshEvaluateDashboard() {
        // Initialize evaluations structure if not exists
        if (!this.currentProject.evaluations) {
            this.currentProject.evaluations = {};
        }

        this.populateTouchpointSelector();
        this.clearEvaluationContent();
    }

    populateTouchpointSelector() {
        const select = document.getElementById('evaluate-touchpoint-select');
        select.innerHTML = '<option value="">Choose a touchpoint to evaluate...</option>';

        this.currentProject.touchpoints.forEach((touchpoint, index) => {
            const option = document.createElement('option');
            option.value = touchpoint.id;
            const number = `TP${index + 1}`;
            option.textContent = `${number}: ${touchpoint.heading}`;
            select.appendChild(option);
        });
    }

    clearEvaluationContent() {
        document.getElementById('evaluation-content').classList.add('hidden');
        document.getElementById('no-touchpoint-selected').classList.remove('hidden');
    }

    handleTouchpointSelection(touchpointId) {
        if (!touchpointId) {
            this.clearEvaluationContent();
            return;
        }

        this.currentTouchpointId = touchpointId;
        const touchpoint = this.currentProject.touchpoints.find(tp => tp.id === touchpointId);

        // Show evaluation content
        document.getElementById('evaluation-content').classList.remove('hidden');
        document.getElementById('no-touchpoint-selected').classList.add('hidden');

        // Load existing evaluation or create new one
        if (!this.currentProject.evaluations[touchpointId]) {
            this.currentProject.evaluations[touchpointId] = {
                decisionMakingEvaluation: '',
                outcomeProgress: {},
                actionItems: []
            };
        }

        this.loadEvaluationData(touchpointId);
        this.refreshOutcomeProgress();
        this.refreshActionItems();
    }

    loadEvaluationData(touchpointId) {
        const evaluation = this.currentProject.evaluations[touchpointId];

        // Load decision making evaluation
        document.getElementById('decision-making-evaluation').value = evaluation.decisionMakingEvaluation || '';
    }

    refreshOutcomeProgress() {
        const container = document.getElementById('outcome-progress-list');
        container.innerHTML = '';

        const evaluation = this.currentProject.evaluations[this.currentTouchpointId];

        this.currentProject.outcomes.forEach((outcome, index) => {
            const letter = String.fromCharCode(65 + index);
            const progressData = evaluation.outcomeProgress[outcome.id] || {
                progress: '',
                justification: '',
                trend: ''
            };

            const progressItem = document.createElement('div');
            progressItem.className = 'outcome-progress-item';
            progressItem.innerHTML = `
                <div class="outcome-progress-header">
                    <div class="outcome-letter">${letter}</div>
                    <div class="outcome-title">${outcome.heading}</div>
                </div>
                <div class="outcome-progress-fields">
                    <div class="form-group">
                        <label>Progress towards outcome</label>
                        <textarea id="progress-${outcome.id}" placeholder="Describe progress towards this outcome for the selected touchpoint...">${progressData.progress}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Justification</label>
                        <textarea id="justification-${outcome.id}" placeholder="Provide justification for the progress assessment...">${progressData.justification}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Trend</label>
                        <div class="trend-selector">
                            <label class="trend-option trend-improving">
                                <input type="radio" name="trend-${outcome.id}" value="improving" ${progressData.trend === 'improving' ? 'checked' : ''}>
                                ↗ Improving
                            </label>
                            <label class="trend-option trend-declining">
                                <input type="radio" name="trend-${outcome.id}" value="declining" ${progressData.trend === 'declining' ? 'checked' : ''}>
                                ↘ Declining
                            </label>
                            <label class="trend-option trend-stable">
                                <input type="radio" name="trend-${outcome.id}" value="stable" ${progressData.trend === 'stable' ? 'checked' : ''}>
                                → Staying stable
                            </label>
                            <label class="trend-option trend-unknown">
                                <input type="radio" name="trend-${outcome.id}" value="unknown" ${progressData.trend === 'unknown' ? 'checked' : ''}>
                                ? Don't know
                            </label>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(progressItem);
        });
    }

    showAddActionForm() {
        document.getElementById('add-action-form').classList.remove('hidden');
        document.getElementById('action-description').focus();
    }

    hideAddActionForm() {
        document.getElementById('add-action-form').classList.add('hidden');
        this.clearActionForm();
    }

    clearActionForm() {
        document.getElementById('action-description').value = '';
        document.getElementById('action-priority').value = 'Medium';
        document.getElementById('action-due-date').value = '';
    }

    saveActionItem() {
        const description = document.getElementById('action-description').value.trim();
        const priority = document.getElementById('action-priority').value;
        const dueDate = document.getElementById('action-due-date').value;

        if (!description) {
            alert('Please enter an action item description.');
            return;
        }

        const actionItem = {
            id: Date.now().toString(),
            description: description,
            priority: priority,
            dueDate: dueDate,
            completed: false,
            createdDate: new Date().toISOString()
        };

        const evaluation = this.currentProject.evaluations[this.currentTouchpointId];
        evaluation.actionItems.push(actionItem);

        this.saveData();
        this.refreshActionItems();
        this.refreshEvaluationOverview();
        this.hideAddActionForm();
    }

    refreshActionItems() {
        const container = document.getElementById('action-items-list');
        const emptyState = document.getElementById('actions-empty-state');
        const evaluation = this.currentProject.evaluations[this.currentTouchpointId];

        container.innerHTML = '';

        if (evaluation.actionItems.length === 0) {
            emptyState.classList.remove('hidden');
            container.style.display = 'none';
        } else {
            emptyState.classList.add('hidden');
            container.style.display = 'block';

            evaluation.actionItems.forEach((actionItem, index) => {
                const actionElement = this.createActionItemElement(actionItem, index);
                container.appendChild(actionElement);
            });
        }
    }

    createActionItemElement(actionItem, index) {
        const actionDiv = document.createElement('div');
        actionDiv.className = 'action-item';

        const dueText = actionItem.dueDate ?
            `Due: ${new Date(actionItem.dueDate).toLocaleDateString()}` :
            'No due date';

        actionDiv.innerHTML = `
            <div class="action-item-content">
                <div class="action-description">${actionItem.description}</div>
                <div class="action-meta">
                    <span class="priority-badge priority-${actionItem.priority.toLowerCase()}">${actionItem.priority}</span>
                    <span>${dueText}</span>
                    <span>Created: ${new Date(actionItem.createdDate).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="action-item-actions">
                <button class="btn btn-small btn-secondary" onclick="app.editActionItem(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="app.deleteActionItem(${index})">Delete</button>
            </div>
        `;

        return actionDiv;
    }

    editActionItem(index) {
        // TODO: Implement edit action item
        console.log('Edit action item', index);
    }

    deleteActionItem(index) {
        if (confirm('Are you sure you want to delete this action item?')) {
            const evaluation = this.currentProject.evaluations[this.currentTouchpointId];
            evaluation.actionItems.splice(index, 1);
            this.saveData();
            this.refreshActionItems();
            this.refreshEvaluationOverview();
        }
    }

    saveEvaluation() {
        const evaluation = this.currentProject.evaluations[this.currentTouchpointId];

        // Save decision making evaluation
        evaluation.decisionMakingEvaluation = document.getElementById('decision-making-evaluation').value.trim();

        // Save outcome progress for each outcome
        this.currentProject.outcomes.forEach(outcome => {
            const progress = document.getElementById(`progress-${outcome.id}`).value.trim();
            const justification = document.getElementById(`justification-${outcome.id}`).value.trim();
            const trendRadios = document.getElementsByName(`trend-${outcome.id}`);
            let trend = '';

            for (const radio of trendRadios) {
                if (radio.checked) {
                    trend = radio.value;
                    break;
                }
            }

            evaluation.outcomeProgress[outcome.id] = {
                progress: progress,
                justification: justification,
                trend: trend
            };
        });

        this.saveData();
        this.refreshEvaluationOverview();
        alert('Evaluation saved successfully!');
    }

    exportEvaluations() {
        if (Object.keys(this.currentProject.evaluations).length === 0) {
            alert('No evaluations to export.');
            return;
        }

        // Create CSV headers
        let headers = ['Touchpoint', 'Decision Making Evaluation'];

        // Add outcome headers for progress, justification, and trend
        this.currentProject.outcomes.forEach((outcome, index) => {
            const letter = String.fromCharCode(65 + index);
            headers.push(`${letter} - Progress`, `${letter} - Justification`, `${letter} - Trend`);
        });

        headers.push('Action Items Count');

        let csvContent = headers.join(',') + '\n';

        // Add evaluation rows
        Object.keys(this.currentProject.evaluations).forEach(touchpointId => {
            const touchpoint = this.currentProject.touchpoints.find(tp => tp.id === touchpointId);
            const evaluation = this.currentProject.evaluations[touchpointId];

            if (!touchpoint) return;

            let row = [
                `"${touchpoint.number}: ${touchpoint.heading}"`,
                `"${evaluation.decisionMakingEvaluation.replace(/"/g, '""')}"`
            ];

            // Add outcome data
            this.currentProject.outcomes.forEach(outcome => {
                const outcomeData = evaluation.outcomeProgress[outcome.id] || {};
                row.push(
                    `"${(outcomeData.progress || '').replace(/"/g, '""')}"`,
                    `"${(outcomeData.justification || '').replace(/"/g, '""')}"`,
                    `"${outcomeData.trend || ''}"`
                );
            });

            // Add action items count
            row.push(`"${evaluation.actionItems.length}"`);

            csvContent += row.join(',') + '\n';
        });

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentProject.name}-evaluations.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Method to refresh the evaluation overview dashboard within the evaluate phase
    refreshEvaluationOverview() {
        // Check if the evaluation overview element exists
        const overviewElement = document.getElementById('evaluation-overview');
        if (!overviewElement) {
            return; // Element doesn't exist in current design, skip refresh
        }

        // Check if there's any evaluation data
        if (!this.currentProject.evaluations || Object.keys(this.currentProject.evaluations).length === 0) {
            overviewElement.style.display = 'none';
            return;
        }

        overviewElement.style.display = 'block';
        this.refreshSummaryStats();
        this.refreshOutcomeTrends();
        this.refreshTouchpointEvaluationsTable();
        this.refreshActionItemsSummary();
    }

    // ================================
    // Dashboard Methods
    // ================================

    refreshDashboard() {
        // Check if there's any evaluation data
        if (!this.currentProject.evaluations || Object.keys(this.currentProject.evaluations).length === 0) {
            document.getElementById('dashboard-content').classList.add('hidden');
            document.getElementById('dashboard-empty-state').classList.remove('hidden');
            return;
        }

        document.getElementById('dashboard-content').classList.remove('hidden');
        document.getElementById('dashboard-empty-state').classList.add('hidden');

        this.refreshSummaryStats();
        this.refreshOutcomeTrends();
        this.refreshTouchpointEvaluationsTable();
        this.refreshActionItemsSummary();
    }

    refreshSummaryStats() {
        const totalTouchpoints = this.currentProject.touchpoints.length;
        const evaluatedTouchpoints = Object.keys(this.currentProject.evaluations).length;
        const completionPercentage = totalTouchpoints > 0 ? Math.round((evaluatedTouchpoints / totalTouchpoints) * 100) : 0;

        // Count total action items
        let totalActionItems = 0;
        Object.values(this.currentProject.evaluations).forEach(evaluation => {
            totalActionItems += evaluation.actionItems.length;
        });

        document.getElementById('total-touchpoints').textContent = totalTouchpoints;
        document.getElementById('evaluated-touchpoints').textContent = evaluatedTouchpoints;
        document.getElementById('total-action-items').textContent = totalActionItems;
        document.getElementById('completion-percentage').textContent = `${completionPercentage}%`;
    }

    refreshOutcomeTrends() {
        const container = document.getElementById('outcome-trends-grid');
        container.innerHTML = '';

        this.currentProject.outcomes.forEach((outcome, index) => {
            const letter = String.fromCharCode(65 + index);
            const trends = this.getTrendSummaryForOutcome(outcome.id);

            const trendCard = document.createElement('div');
            trendCard.className = 'outcome-trend-card';
            trendCard.innerHTML = `
                <div class="outcome-trend-header">
                    <div class="trend-outcome-letter">${letter}</div>
                    <div class="outcome-trend-title">${outcome.heading}</div>
                </div>
                <div class="trend-summary">
                    <div class="trend-count improving">
                        ↗ ${trends.improving}
                    </div>
                    <div class="trend-count declining">
                        ↘ ${trends.declining}
                    </div>
                    <div class="trend-count stable">
                        → ${trends.stable}
                    </div>
                    <div class="trend-count unknown">
                        ? ${trends.unknown}
                    </div>
                </div>
            `;
            container.appendChild(trendCard);
        });
    }

    getTrendSummaryForOutcome(outcomeId) {
        const trends = { improving: 0, declining: 0, stable: 0, unknown: 0 };

        Object.values(this.currentProject.evaluations).forEach(evaluation => {
            const outcomeProgress = evaluation.outcomeProgress[outcomeId];
            if (outcomeProgress && outcomeProgress.trend) {
                trends[outcomeProgress.trend] = (trends[outcomeProgress.trend] || 0) + 1;
            } else {
                trends.unknown++;
            }
        });

        return trends;
    }

    refreshTouchpointEvaluationsTable() {
        const container = document.getElementById('touchpoint-evaluations-table');

        const table = document.createElement('table');
        table.className = 'evaluations-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Touchpoint</th>
                    <th>Status</th>
                    <th>Outcomes Evaluated</th>
                    <th>Action Items</th>
                    <th>Decision Making</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;

        const tbody = table.querySelector('tbody');

        this.currentProject.touchpoints.forEach((touchpoint, index) => {
            const evaluation = this.currentProject.evaluations[touchpoint.id];
            const row = document.createElement('tr');

            let status, statusClass;
            let outcomesEvaluated = 0;
            let actionItemCount = 0;
            let hasDecisionMaking = false;

            if (evaluation) {
                actionItemCount = evaluation.actionItems.length;
                hasDecisionMaking = evaluation.decisionMakingEvaluation && evaluation.decisionMakingEvaluation.trim().length > 0;

                // Count outcomes with progress data
                this.currentProject.outcomes.forEach(outcome => {
                    const outcomeProgress = evaluation.outcomeProgress[outcome.id];
                    if (outcomeProgress && (outcomeProgress.progress || outcomeProgress.justification || outcomeProgress.trend)) {
                        outcomesEvaluated++;
                    }
                });

                if (outcomesEvaluated === this.currentProject.outcomes.length && hasDecisionMaking) {
                    status = 'Completed';
                    statusClass = 'completed';
                } else if (outcomesEvaluated > 0 || hasDecisionMaking || actionItemCount > 0) {
                    status = 'Partial';
                    statusClass = 'partial';
                } else {
                    status = 'Not Started';
                    statusClass = 'not-started';
                }
            } else {
                status = 'Not Started';
                statusClass = 'not-started';
            }

            const touchpointNumber = `TP${index + 1}`;
            row.innerHTML = `
                <td>${touchpointNumber}: ${touchpoint.heading}</td>
                <td><span class="evaluation-status ${statusClass}">${status}</span></td>
                <td>${outcomesEvaluated}/${this.currentProject.outcomes.length}</td>
                <td>${actionItemCount}</td>
                <td>${hasDecisionMaking ? 'Yes' : 'No'}</td>
            `;

            tbody.appendChild(row);
        });

        container.innerHTML = '';
        container.appendChild(table);
    }

    refreshActionItemsSummary() {
        const highContainer = document.getElementById('high-priority-actions');
        const mediumContainer = document.getElementById('medium-priority-actions');
        const lowContainer = document.getElementById('low-priority-actions');

        // Clear containers
        highContainer.innerHTML = '';
        mediumContainer.innerHTML = '';
        lowContainer.innerHTML = '';

        const actionsByPriority = { High: [], Medium: [], Low: [] };

        // Collect all action items by priority
        Object.entries(this.currentProject.evaluations).forEach(([touchpointId, evaluation]) => {
            const touchpoint = this.currentProject.touchpoints.find(tp => tp.id === touchpointId);
            const touchpointIndex = this.currentProject.touchpoints.findIndex(tp => tp.id === touchpointId);
            const touchpointNumber = touchpointIndex >= 0 ? `TP${touchpointIndex + 1}` : 'TP?';

            evaluation.actionItems.forEach(actionItem => {
                actionsByPriority[actionItem.priority].push({
                    ...actionItem,
                    touchpointName: touchpoint ? `${touchpointNumber}: ${touchpoint.heading}` : 'Unknown'
                });
            });
        });

        // Populate containers
        this.populateActionItemsByPriority(highContainer, actionsByPriority.High);
        this.populateActionItemsByPriority(mediumContainer, actionsByPriority.Medium);
        this.populateActionItemsByPriority(lowContainer, actionsByPriority.Low);
    }

    populateActionItemsByPriority(container, actions) {
        if (actions.length === 0) {
            container.innerHTML = '<div class="no-actions">No action items</div>';
            return;
        }

        actions.forEach(action => {
            const actionDiv = document.createElement('div');
            actionDiv.className = 'dashboard-action-item';

            const dueText = action.dueDate ?
                `Due: ${new Date(action.dueDate).toLocaleDateString()}` :
                'No due date';

            actionDiv.innerHTML = `
                <div>${action.description}</div>
                <div class="dashboard-action-meta">
                    ${action.touchpointName} • ${dueText}
                </div>
            `;

            container.appendChild(actionDiv);
        });
    }

    exportAllData() {
        // Create comprehensive CSV export with all project data
        let csvContent = '';

        // Project info header
        csvContent += `Project: ${this.currentProject.name}\n`;
        csvContent += `Reference: ${this.currentProject.reference}\n`;
        csvContent += `Export Date: ${new Date().toLocaleDateString()}\n\n`;

        // Outcomes
        csvContent += 'OUTCOMES\n';
        csvContent += 'Letter,Heading,Description\n';
        this.currentProject.outcomes.forEach((outcome, index) => {
            const letter = String.fromCharCode(65 + index);
            csvContent += `"${letter}","${outcome.heading}","${outcome.description || ''}"\n`;
        });
        csvContent += '\n';

        // Touchpoints
        csvContent += 'TOUCHPOINTS\n';
        csvContent += 'Number,Heading,Description\n';
        this.currentProject.touchpoints.forEach((touchpoint, index) => {
            const number = `TP${index + 1}`;
            csvContent += `"${number}","${touchpoint.heading}","${touchpoint.description || ''}"\n`;
        });
        csvContent += '\n';

        // Indicators
        csvContent += 'INDICATORS\n';
        csvContent += 'Description,Baseline,Related Outcomes,Related Touchpoints\n';
        this.currentProject.indicators.forEach(indicator => {
            const relatedOutcomes = this.getRelatedOutcomesForIndicator(indicator.id);
            const relatedTouchpoints = this.getRelatedTouchpointsForIndicator(indicator.id);
            csvContent += `"${indicator.description}","${indicator.baseline || ''}","${relatedOutcomes}","${relatedTouchpoints}"\n`;
        });
        csvContent += '\n';

        // Decisions
        if (this.currentProject.decisions && this.currentProject.decisions.length > 0) {
            csvContent += 'DECISIONS\n';
            csvContent += 'Ref No,Date,Topic,Status,Description,Justification,Actions,Impact\n';
            this.currentProject.decisions.forEach(decision => {
                csvContent += `"${decision.refNo}","${decision.date}","${decision.topic}","${decision.status}","${decision.description}","${decision.justification}","${decision.actions}","${decision.impact}"\n`;
            });
            csvContent += '\n';
        }

        // Evaluations
        if (this.currentProject.evaluations && Object.keys(this.currentProject.evaluations).length > 0) {
            csvContent += 'EVALUATIONS\n';
            csvContent += 'Touchpoint,Decision Making Evaluation,Outcome,Progress,Justification,Trend\n';

            Object.entries(this.currentProject.evaluations).forEach(([touchpointId, evaluation]) => {
                const touchpoint = this.currentProject.touchpoints.find(tp => tp.id === touchpointId);
                const touchpointIndex = this.currentProject.touchpoints.findIndex(tp => tp.id === touchpointId);
                const touchpointNumber = touchpointIndex >= 0 ? `TP${touchpointIndex + 1}` : 'TP?';
                const touchpointName = touchpoint ? `${touchpointNumber}: ${touchpoint.heading}` : 'Unknown';

                this.currentProject.outcomes.forEach((outcome, index) => {
                    const letter = String.fromCharCode(65 + index);
                    const outcomeProgress = evaluation.outcomeProgress[outcome.id] || {};

                    csvContent += `"${touchpointName}","${evaluation.decisionMakingEvaluation || ''}","${letter}: ${outcome.heading}","${outcomeProgress.progress || ''}","${outcomeProgress.justification || ''}","${outcomeProgress.trend || ''}"\n`;
                });
            });
            csvContent += '\n';

            // Action Items
            csvContent += 'ACTION ITEMS\n';
            csvContent += 'Touchpoint,Description,Priority,Due Date,Created Date\n';

            Object.entries(this.currentProject.evaluations).forEach(([touchpointId, evaluation]) => {
                const touchpoint = this.currentProject.touchpoints.find(tp => tp.id === touchpointId);
                const touchpointIndex = this.currentProject.touchpoints.findIndex(tp => tp.id === touchpointId);
                const touchpointNumber = touchpointIndex >= 0 ? `TP${touchpointIndex + 1}` : 'TP?';
                const touchpointName = touchpoint ? `${touchpointNumber}: ${touchpoint.heading}` : 'Unknown';

                evaluation.actionItems.forEach(actionItem => {
                    const dueDate = actionItem.dueDate || '';
                    const createdDate = new Date(actionItem.createdDate).toLocaleDateString();
                    csvContent += `"${touchpointName}","${actionItem.description}","${actionItem.priority}","${dueDate}","${createdDate}"\n`;
                });
            });
        }

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentProject.name}-complete-export.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    getRelatedOutcomesForIndicator(indicatorId) {
        // Helper method to get related outcomes for CSV export
        const relatedOutcomes = [];
        // This would need to be implemented based on your relationship data structure
        // For now, returning empty string
        return relatedOutcomes.join(', ');
    }

    getRelatedTouchpointsForIndicator(indicatorId) {
        // Helper method to get related touchpoints for CSV export
        const relatedTouchpoints = [];
        // This would need to be implemented based on your relationship data structure
        // For now, returning empty string
        return relatedTouchpoints.join(', ');
    }

    // Helper method to truncate text for display
    truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + '...';
    }

    // ================================
    // Review Page Methods
    // ================================

    refreshReviewPage() {
        if (!this.currentProject) return;

        // Check if we have outcomes and indicators
        const hasData = this.currentProject.outcomes && this.currentProject.outcomes.length > 0 &&
                       this.currentProject.indicators && this.currentProject.indicators.length > 0;

        if (!hasData) {
            document.getElementById('review-content').classList.add('hidden');
            document.getElementById('review-empty-state').classList.remove('hidden');
            return;
        }

        document.getElementById('review-content').classList.remove('hidden');
        document.getElementById('review-empty-state').classList.add('hidden');

        // Load saved review data if exists
        const review = this.currentProject.finalReview || {};

        // Load project reflection
        document.getElementById('project-reflection').value = review.projectReflection || '';

        // Load retrospective questions
        document.getElementById('change-analysis').value = review.changeAnalysis || '';
        document.getElementById('lessons-learnt').value = review.lessonsLearnt || '';
        document.getElementById('standout-stats').value = review.standoutStats || '';

        // Load outcomes final evaluation
        this.loadOutcomesFinalEvaluation();

        // Load indicators final measurements
        this.loadIndicatorsFinalMeasurements();
    }

    loadOutcomesFinalEvaluation() {
        const container = document.getElementById('outcomes-final-evaluation-list');
        if (!container) return;

        container.innerHTML = '';

        const review = this.currentProject.finalReview || {};
        const outcomeEvaluations = review.outcomeEvaluations || {};

        this.currentProject.outcomes.forEach((outcome, index) => {
            const letter = String.fromCharCode(65 + index);
            const evaluation = outcomeEvaluations[outcome.id] || {};

            const html = `
                <div class="outcome-final-eval-item" data-outcome-id="${outcome.id}">
                    <h4>Outcome ${letter}: ${outcome.heading}</h4>
                    <div class="form-group">
                        <label for="outcome-progress-${outcome.id}">Final evaluation on progress towards outcome</label>
                        <textarea id="outcome-progress-${outcome.id}" rows="4" placeholder="Evaluate the final progress towards this outcome...">${evaluation.progress || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="outcome-justification-${outcome.id}">Justification (evidence from indicators)</label>
                        <textarea id="outcome-justification-${outcome.id}" rows="4" placeholder="Provide justification and evidence from indicators...">${evaluation.justification || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Trend</label>
                        <div class="trend-options">
                            <label class="trend-option">
                                <input type="radio" name="outcome-trend-${outcome.id}" value="up" ${evaluation.trend === 'up' ? 'checked' : ''}>
                                <span class="trend-arrow">↑ Improving</span>
                            </label>
                            <label class="trend-option">
                                <input type="radio" name="outcome-trend-${outcome.id}" value="stable" ${evaluation.trend === 'stable' ? 'checked' : ''}>
                                <span class="trend-arrow">→ Stable</span>
                            </label>
                            <label class="trend-option">
                                <input type="radio" name="outcome-trend-${outcome.id}" value="down" ${evaluation.trend === 'down' ? 'checked' : ''}>
                                <span class="trend-arrow">↓ Declining</span>
                            </label>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML += html;
        });
    }

    loadIndicatorsFinalMeasurements() {
        const container = document.getElementById('indicators-final-measurements-list');
        if (!container) return;

        container.innerHTML = '';

        const review = this.currentProject.finalReview || {};
        const indicatorMeasurements = review.indicatorMeasurements || {};

        this.currentProject.indicators.forEach((indicator, index) => {
            const measurement = indicatorMeasurements[indicator.id] || {};

            const html = `
                <div class="indicator-final-measurement-item" data-indicator-id="${indicator.id}">
                    <h4>Indicator ${index + 1}: ${indicator.description}</h4>
                    <div class="measurement-row">
                        <div class="form-group">
                            <label>Baseline Value</label>
                            <input type="text" value="${indicator.baseline || 'Not set'}" readonly disabled>
                        </div>
                        <div class="form-group">
                            <label for="indicator-final-${indicator.id}">Final Measurement</label>
                            <input type="text" id="indicator-final-${indicator.id}" placeholder="Enter final measurement..." value="${measurement.finalValue || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Trend</label>
                        <div class="trend-options">
                            <label class="trend-option">
                                <input type="radio" name="indicator-trend-${indicator.id}" value="up" ${measurement.trend === 'up' ? 'checked' : ''}>
                                <span class="trend-arrow">↑ Improving</span>
                            </label>
                            <label class="trend-option">
                                <input type="radio" name="indicator-trend-${indicator.id}" value="stable" ${measurement.trend === 'stable' ? 'checked' : ''}>
                                <span class="trend-arrow">→ Stable</span>
                            </label>
                            <label class="trend-option">
                                <input type="radio" name="indicator-trend-${indicator.id}" value="down" ${measurement.trend === 'down' ? 'checked' : ''}>
                                <span class="trend-arrow">↓ Declining</span>
                            </label>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML += html;
        });
    }

    saveFinalReview() {
        if (!this.currentProject.finalReview) {
            this.currentProject.finalReview = {};
        }

        // Save project reflection
        this.currentProject.finalReview.projectReflection = document.getElementById('project-reflection').value.trim();

        // Save retrospective questions
        this.currentProject.finalReview.changeAnalysis = document.getElementById('change-analysis').value.trim();
        this.currentProject.finalReview.lessonsLearnt = document.getElementById('lessons-learnt').value.trim();
        this.currentProject.finalReview.standoutStats = document.getElementById('standout-stats').value.trim();

        // Save outcome evaluations
        const outcomeEvaluations = {};
        this.currentProject.outcomes.forEach(outcome => {
            const progress = document.getElementById(`outcome-progress-${outcome.id}`).value.trim();
            const justification = document.getElementById(`outcome-justification-${outcome.id}`).value.trim();
            const trendRadios = document.getElementsByName(`outcome-trend-${outcome.id}`);
            let trend = '';

            for (const radio of trendRadios) {
                if (radio.checked) {
                    trend = radio.value;
                    break;
                }
            }

            outcomeEvaluations[outcome.id] = {
                progress,
                justification,
                trend
            };
        });
        this.currentProject.finalReview.outcomeEvaluations = outcomeEvaluations;

        // Save indicator measurements
        const indicatorMeasurements = {};
        this.currentProject.indicators.forEach(indicator => {
            const finalValue = document.getElementById(`indicator-final-${indicator.id}`).value.trim();
            const trendRadios = document.getElementsByName(`indicator-trend-${indicator.id}`);
            let trend = '';

            for (const radio of trendRadios) {
                if (radio.checked) {
                    trend = radio.value;
                    break;
                }
            }

            indicatorMeasurements[indicator.id] = {
                finalValue,
                trend
            };
        });
        this.currentProject.finalReview.indicatorMeasurements = indicatorMeasurements;

        this.saveData();
        alert('Final review saved successfully!');
    }

    viewFinalReport() {
        // Create a modal or new page to display the final report
        const reportWindow = window.open('', '_blank');
        reportWindow.document.write(this.generateFinalReportHTML());
        reportWindow.document.close();
    }

    generateFinalReportHTML() {
        if (!this.currentProject || !this.currentProject.finalReview) {
            return '<html><body><h1>No final review data available</h1></body></html>';
        }

        const review = this.currentProject.finalReview;

        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${this.currentProject.name} - Final Project Review</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        max-width: 900px;
                        margin: 40px auto;
                        padding: 20px;
                        line-height: 1.6;
                        color: #333;
                    }
                    h1 {
                        color: #2c3e50;
                        border-bottom: 3px solid #e67e22;
                        padding-bottom: 10px;
                    }
                    h2 {
                        color: #2c3e50;
                        margin-top: 30px;
                        border-bottom: 2px solid #e9ecef;
                        padding-bottom: 8px;
                    }
                    h3 {
                        color: #27ae60;
                        margin-top: 20px;
                    }
                    .section {
                        margin-bottom: 30px;
                        padding: 20px;
                        background: #f8f9fa;
                        border-left: 4px solid #3498db;
                        border-radius: 4px;
                    }
                    .outcome-item, .indicator-item {
                        margin-bottom: 20px;
                        padding: 15px;
                        background: white;
                        border: 1px solid #dee2e6;
                        border-radius: 6px;
                    }
                    .trend {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-weight: bold;
                    }
                    .trend.up { background: #d4edda; color: #155724; }
                    .trend.stable { background: #fff3cd; color: #856404; }
                    .trend.down { background: #f8d7da; color: #721c24; }
                    .measurement-comparison {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin-top: 10px;
                    }
                    @media print {
                        body { margin: 0; }
                        .section { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <h1>${this.currentProject.name} - Final Project Review</h1>
                <p><strong>Project Reference:</strong> ${this.currentProject.reference}</p>
                <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString()}</p>

                <h2>Project Overview</h2>
                <div class="section">
                    <p>${review.projectReflection || 'No reflection provided.'}</p>
                </div>

                <h2>Outcomes Final Evaluation</h2>
        `;

        this.currentProject.outcomes.forEach((outcome, index) => {
            const letter = String.fromCharCode(65 + index);
            const outcomeEval = review.outcomeEvaluations?.[outcome.id] || {};

            html += `
                <div class="outcome-item">
                    <h3>Outcome ${letter}: ${outcome.heading}</h3>
                    <p><strong>Progress:</strong> ${outcomeEval.progress || 'Not evaluated'}</p>
                    <p><strong>Justification:</strong> ${outcomeEval.justification || 'Not provided'}</p>
                    <p><strong>Trend:</strong> <span class="trend ${outcomeEval.trend || ''}">${this.formatTrend(outcomeEval.trend)}</span></p>
                </div>
            `;
        });

        html += `<h2>Indicators Final Measurements</h2>`;

        this.currentProject.indicators.forEach((indicator, index) => {
            const measurement = review.indicatorMeasurements?.[indicator.id] || {};

            html += `
                <div class="indicator-item">
                    <h3>Indicator ${index + 1}: ${indicator.description}</h3>
                    <div class="measurement-comparison">
                        <div><strong>Baseline:</strong> ${indicator.baseline || 'Not set'}</div>
                        <div><strong>Final Measurement:</strong> ${measurement.finalValue || 'Not measured'}</div>
                    </div>
                    <p><strong>Trend:</strong> <span class="trend ${measurement.trend || ''}">${this.formatTrend(measurement.trend)}</span></p>
                </div>
            `;
        });

        html += `
                <h2>Retrospective Analysis</h2>

                <div class="section">
                    <h3>Change Analysis</h3>
                    <p>${review.changeAnalysis || 'Not provided'}</p>
                </div>

                <div class="section">
                    <h3>Lessons Learnt</h3>
                    <p>${review.lessonsLearnt || 'Not provided'}</p>
                </div>

                <div class="section">
                    <h3>Standout Success Stats</h3>
                    <p>${review.standoutStats || 'Not provided'}</p>
                </div>
            </body>
            </html>
        `;

        return html;
    }

    formatTrend(trend) {
        switch(trend) {
            case 'up': return '↑ Improving';
            case 'stable': return '→ Stable';
            case 'down': return '↓ Declining';
            default: return 'Not specified';
        }
    }

    downloadFinalReport() {
        if (!this.currentProject || !this.currentProject.finalReview) {
            alert('No final review data available to download.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const review = this.currentProject.finalReview;

        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);

        // Helper function to add text with word wrap
        const addText = (text, size, style = 'normal', color = [0, 0, 0]) => {
            doc.setFontSize(size);
            doc.setFont('helvetica', style);
            doc.setTextColor(...color);
            const lines = doc.splitTextToSize(text, maxWidth);

            lines.forEach(line => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(line, margin, yPos);
                yPos += size * 0.5;
            });
            yPos += 3;
        };

        // Title
        addText(`${this.currentProject.name}`, 18, 'bold', [44, 62, 80]);
        addText(`Final Project Review`, 16, 'bold', [230, 126, 34]);
        yPos += 5;

        // Project Info
        addText(`Project Reference: ${this.currentProject.reference}`, 10, 'normal');
        addText(`Report Generated: ${new Date().toLocaleDateString()}`, 10, 'normal');
        yPos += 10;

        // Project Overview
        addText('Project Overview', 14, 'bold', [44, 62, 80]);
        yPos += 2;
        if (review.projectReflection) {
            addText(review.projectReflection, 10, 'normal');
        } else {
            addText('No reflection provided.', 10, 'italic', [150, 150, 150]);
        }
        yPos += 5;

        // Outcomes Final Evaluation
        addText('Outcomes Final Evaluation', 14, 'bold', [44, 62, 80]);
        yPos += 2;

        this.currentProject.outcomes.forEach((outcome, index) => {
            const letter = String.fromCharCode(65 + index);
            const outcomeEval = review.outcomeEvaluations?.[outcome.id] || {};

            addText(`Outcome ${letter}: ${outcome.heading}`, 12, 'bold', [39, 174, 96]);

            addText('Progress:', 10, 'bold');
            addText(outcomeEval.progress || 'Not evaluated', 10, 'normal');

            addText('Justification:', 10, 'bold');
            addText(outcomeEval.justification || 'Not provided', 10, 'normal');

            addText('Trend:', 10, 'bold');
            addText(this.formatTrend(outcomeEval.trend), 10, 'normal');

            yPos += 3;
        });

        yPos += 5;

        // Indicators Final Measurements
        addText('Indicators Final Measurements', 14, 'bold', [44, 62, 80]);
        yPos += 2;

        this.currentProject.indicators.forEach((indicator, index) => {
            const measurement = review.indicatorMeasurements?.[indicator.id] || {};

            addText(`Indicator ${index + 1}: ${indicator.description}`, 12, 'bold', [39, 174, 96]);

            addText(`Baseline: ${indicator.baseline || 'Not set'}`, 10, 'normal');
            addText(`Final Measurement: ${measurement.finalValue || 'Not measured'}`, 10, 'normal');
            addText(`Trend: ${this.formatTrend(measurement.trend)}`, 10, 'normal');

            yPos += 3;
        });

        yPos += 5;

        // Retrospective Analysis
        addText('Retrospective Analysis', 14, 'bold', [44, 62, 80]);
        yPos += 2;

        addText('Change Analysis', 12, 'bold', [52, 152, 219]);
        if (review.changeAnalysis) {
            addText(review.changeAnalysis, 10, 'normal');
        } else {
            addText('Not provided', 10, 'italic', [150, 150, 150]);
        }
        yPos += 3;

        addText('Lessons Learnt', 12, 'bold', [52, 152, 219]);
        if (review.lessonsLearnt) {
            addText(review.lessonsLearnt, 10, 'normal');
        } else {
            addText('Not provided', 10, 'italic', [150, 150, 150]);
        }
        yPos += 3;

        addText('Standout Success Stats', 12, 'bold', [52, 152, 219]);
        if (review.standoutStats) {
            addText(review.standoutStats, 10, 'normal');
        } else {
            addText('Not provided', 10, 'italic', [150, 150, 150]);
        }

        // Save the PDF
        doc.save(`${this.currentProject.reference}_Final_Review_${new Date().toISOString().split('T')[0]}.pdf`);
    }
}

// Initialize the app
const app = new ProjectPlanningApp();