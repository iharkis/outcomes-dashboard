-- SQL Server Database Schema for Project Planning Data Capture System
-- This script creates all necessary tables, relationships, and indexes

USE [ProjectPlanningDB]
GO

-- ================================================
-- Table: Projects
-- Stores project information
-- ================================================
CREATE TABLE [dbo].[Projects] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [Name] NVARCHAR(255) NOT NULL,
    [Reference] NVARCHAR(100) NOT NULL,
    [CreatedDate] DATETIME2 DEFAULT GETUTCDATE(),
    [ModifiedDate] DATETIME2 DEFAULT GETUTCDATE(),
    [IsActive] BIT DEFAULT 1
);

-- Add unique constraint on Reference to prevent duplicates
ALTER TABLE [dbo].[Projects]
ADD CONSTRAINT [UQ_Projects_Reference] UNIQUE ([Reference]);

-- ================================================
-- Table: Outcomes
-- Stores outcomes for each project with auto-sequencing
-- ================================================
CREATE TABLE [dbo].[Outcomes] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ProjectId] UNIQUEIDENTIFIER NOT NULL,
    [Heading] NVARCHAR(500) NOT NULL,
    [Description] NVARCHAR(MAX) NULL,
    [SequenceOrder] INT NOT NULL,
    [Letter] AS (CHAR(64 + [SequenceOrder])) PERSISTED, -- Computed column: A, B, C, etc.
    [CreatedDate] DATETIME2 DEFAULT GETUTCDATE(),
    [ModifiedDate] DATETIME2 DEFAULT GETUTCDATE(),
    [IsActive] BIT DEFAULT 1,

    -- Foreign key constraint
    CONSTRAINT [FK_Outcomes_Projects]
        FOREIGN KEY ([ProjectId])
        REFERENCES [dbo].[Projects]([Id])
        ON DELETE CASCADE
);

-- Unique constraint to ensure sequence order is unique per project
ALTER TABLE [dbo].[Outcomes]
ADD CONSTRAINT [UQ_Outcomes_ProjectId_SequenceOrder]
    UNIQUE ([ProjectId], [SequenceOrder]);

-- ================================================
-- Table: Touchpoints
-- Stores touchpoints for each project with auto-numbering
-- ================================================
CREATE TABLE [dbo].[Touchpoints] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ProjectId] UNIQUEIDENTIFIER NOT NULL,
    [Heading] NVARCHAR(500) NOT NULL,
    [Description] NVARCHAR(MAX) NULL,
    [SequenceOrder] INT NOT NULL,
    [Number] AS ('TP' + CAST([SequenceOrder] AS NVARCHAR(10))) PERSISTED, -- Computed column: TP1, TP2, etc.
    [CreatedDate] DATETIME2 DEFAULT GETUTCDATE(),
    [ModifiedDate] DATETIME2 DEFAULT GETUTCDATE(),
    [IsActive] BIT DEFAULT 1,

    -- Foreign key constraint
    CONSTRAINT [FK_Touchpoints_Projects]
        FOREIGN KEY ([ProjectId])
        REFERENCES [dbo].[Projects]([Id])
        ON DELETE CASCADE
);

-- Unique constraint to ensure sequence order is unique per project
ALTER TABLE [dbo].[Touchpoints]
ADD CONSTRAINT [UQ_Touchpoints_ProjectId_SequenceOrder]
    UNIQUE ([ProjectId], [SequenceOrder]);

-- ================================================
-- Table: Indicators
-- Stores indicators for each project
-- ================================================
CREATE TABLE [dbo].[Indicators] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ProjectId] UNIQUEIDENTIFIER NOT NULL,
    [Description] NVARCHAR(MAX) NOT NULL,
    [Baseline] NVARCHAR(255) NULL,
    [CreatedDate] DATETIME2 DEFAULT GETUTCDATE(),
    [ModifiedDate] DATETIME2 DEFAULT GETUTCDATE(),
    [IsActive] BIT DEFAULT 1,

    -- Foreign key constraint
    CONSTRAINT [FK_Indicators_Projects]
        FOREIGN KEY ([ProjectId])
        REFERENCES [dbo].[Projects]([Id])
        ON DELETE CASCADE
);

-- ================================================
-- Junction Table: IndicatorOutcomes
-- Many-to-many relationship between Indicators and Outcomes
-- ================================================
CREATE TABLE [dbo].[IndicatorOutcomes] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [IndicatorId] UNIQUEIDENTIFIER NOT NULL,
    [OutcomeId] UNIQUEIDENTIFIER NOT NULL,
    [CreatedDate] DATETIME2 DEFAULT GETUTCDATE(),

    -- Foreign key constraints
    CONSTRAINT [FK_IndicatorOutcomes_Indicators]
        FOREIGN KEY ([IndicatorId])
        REFERENCES [dbo].[Indicators]([Id])
        ON DELETE CASCADE,

    CONSTRAINT [FK_IndicatorOutcomes_Outcomes]
        FOREIGN KEY ([OutcomeId])
        REFERENCES [dbo].[Outcomes]([Id])
        ON DELETE CASCADE
);

-- Unique constraint to prevent duplicate relationships
ALTER TABLE [dbo].[IndicatorOutcomes]
ADD CONSTRAINT [UQ_IndicatorOutcomes_IndicatorId_OutcomeId]
    UNIQUE ([IndicatorId], [OutcomeId]);

-- ================================================
-- Junction Table: IndicatorTouchpoints
-- Many-to-many relationship between Indicators and Touchpoints
-- ================================================
CREATE TABLE [dbo].[IndicatorTouchpoints] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [IndicatorId] UNIQUEIDENTIFIER NOT NULL,
    [TouchpointId] UNIQUEIDENTIFIER NOT NULL,
    [CreatedDate] DATETIME2 DEFAULT GETUTCDATE(),

    -- Foreign key constraints
    CONSTRAINT [FK_IndicatorTouchpoints_Indicators]
        FOREIGN KEY ([IndicatorId])
        REFERENCES [dbo].[Indicators]([Id])
        ON DELETE CASCADE,

    CONSTRAINT [FK_IndicatorTouchpoints_Touchpoints]
        FOREIGN KEY ([TouchpointId])
        REFERENCES [dbo].[Touchpoints]([Id])
        ON DELETE CASCADE
);

-- Unique constraint to prevent duplicate relationships
ALTER TABLE [dbo].[IndicatorTouchpoints]
ADD CONSTRAINT [UQ_IndicatorTouchpoints_IndicatorId_TouchpointId]
    UNIQUE ([IndicatorId], [TouchpointId]);

-- ================================================
-- Indexes for Performance
-- ================================================

-- Projects
CREATE INDEX [IX_Projects_Reference] ON [dbo].[Projects]([Reference]);
CREATE INDEX [IX_Projects_CreatedDate] ON [dbo].[Projects]([CreatedDate]);

-- Outcomes
CREATE INDEX [IX_Outcomes_ProjectId] ON [dbo].[Outcomes]([ProjectId]);
CREATE INDEX [IX_Outcomes_ProjectId_SequenceOrder] ON [dbo].[Outcomes]([ProjectId], [SequenceOrder]);

-- Touchpoints
CREATE INDEX [IX_Touchpoints_ProjectId] ON [dbo].[Touchpoints]([ProjectId]);
CREATE INDEX [IX_Touchpoints_ProjectId_SequenceOrder] ON [dbo].[Touchpoints]([ProjectId], [SequenceOrder]);

-- Indicators
CREATE INDEX [IX_Indicators_ProjectId] ON [dbo].[Indicators]([ProjectId]);

-- IndicatorOutcomes
CREATE INDEX [IX_IndicatorOutcomes_IndicatorId] ON [dbo].[IndicatorOutcomes]([IndicatorId]);
CREATE INDEX [IX_IndicatorOutcomes_OutcomeId] ON [dbo].[IndicatorOutcomes]([OutcomeId]);

-- IndicatorTouchpoints
CREATE INDEX [IX_IndicatorTouchpoints_IndicatorId] ON [dbo].[IndicatorTouchpoints]([IndicatorId]);
CREATE INDEX [IX_IndicatorTouchpoints_TouchpointId] ON [dbo].[IndicatorTouchpoints]([TouchpointId]);

-- ================================================
-- Stored Procedures for Common Operations
-- ================================================

-- Procedure to get next sequence order for outcomes
CREATE PROCEDURE [dbo].[GetNextOutcomeSequence]
    @ProjectId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT ISNULL(MAX([SequenceOrder]), 0) + 1 AS NextSequence
    FROM [dbo].[Outcomes]
    WHERE [ProjectId] = @ProjectId AND [IsActive] = 1
END
GO

-- Procedure to get next sequence order for touchpoints
CREATE PROCEDURE [dbo].[GetNextTouchpointSequence]
    @ProjectId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT ISNULL(MAX([SequenceOrder]), 0) + 1 AS NextSequence
    FROM [dbo].[Touchpoints]
    WHERE [ProjectId] = @ProjectId AND [IsActive] = 1
END
GO

-- Procedure to reorder outcomes after deletion
CREATE PROCEDURE [dbo].[ReorderOutcomes]
    @ProjectId UNIQUEIDENTIFIER
AS
BEGIN
    WITH OrderedOutcomes AS (
        SELECT [Id],
               ROW_NUMBER() OVER (ORDER BY [SequenceOrder], [CreatedDate]) AS NewSequence
        FROM [dbo].[Outcomes]
        WHERE [ProjectId] = @ProjectId AND [IsActive] = 1
    )
    UPDATE o
    SET [SequenceOrder] = oo.NewSequence,
        [ModifiedDate] = GETUTCDATE()
    FROM [dbo].[Outcomes] o
    INNER JOIN OrderedOutcomes oo ON o.[Id] = oo.[Id]
END
GO

-- Procedure to reorder touchpoints after deletion
CREATE PROCEDURE [dbo].[ReorderTouchpoints]
    @ProjectId UNIQUEIDENTIFIER
AS
BEGIN
    WITH OrderedTouchpoints AS (
        SELECT [Id],
               ROW_NUMBER() OVER (ORDER BY [SequenceOrder], [CreatedDate]) AS NewSequence
        FROM [dbo].[Touchpoints]
        WHERE [ProjectId] = @ProjectId AND [IsActive] = 1
    )
    UPDATE t
    SET [SequenceOrder] = ot.NewSequence,
        [ModifiedDate] = GETUTCDATE()
    FROM [dbo].[Touchpoints] t
    INNER JOIN OrderedTouchpoints ot ON t.[Id] = ot.[Id]
END
GO

-- ================================================
-- Views for Simplified Data Access
-- ================================================

-- View for project summary with counts
CREATE VIEW [dbo].[ProjectSummary] AS
SELECT
    p.[Id],
    p.[Name],
    p.[Reference],
    p.[CreatedDate],
    p.[ModifiedDate],
    (SELECT COUNT(*) FROM [dbo].[Outcomes] WHERE [ProjectId] = p.[Id] AND [IsActive] = 1) AS OutcomeCount,
    (SELECT COUNT(*) FROM [dbo].[Touchpoints] WHERE [ProjectId] = p.[Id] AND [IsActive] = 1) AS TouchpointCount,
    (SELECT COUNT(*) FROM [dbo].[Indicators] WHERE [ProjectId] = p.[Id] AND [IsActive] = 1) AS IndicatorCount
FROM [dbo].[Projects] p
WHERE p.[IsActive] = 1
GO

-- View for indicators with their relationships
CREATE VIEW [dbo].[IndicatorDetails] AS
SELECT
    i.[Id],
    i.[ProjectId],
    i.[Description],
    i.[Baseline],
    i.[CreatedDate],
    i.[ModifiedDate],
    -- Concatenated outcome letters
    STUFF((
        SELECT ', ' + o.[Letter]
        FROM [dbo].[IndicatorOutcomes] io
        INNER JOIN [dbo].[Outcomes] o ON io.[OutcomeId] = o.[Id]
        WHERE io.[IndicatorId] = i.[Id] AND o.[IsActive] = 1
        ORDER BY o.[SequenceOrder]
        FOR XML PATH('')
    ), 1, 2, '') AS OutcomeLetters,
    -- Concatenated touchpoint numbers
    STUFF((
        SELECT ', ' + t.[Number]
        FROM [dbo].[IndicatorTouchpoints] it
        INNER JOIN [dbo].[Touchpoints] t ON it.[TouchpointId] = t.[Id]
        WHERE it.[IndicatorId] = i.[Id] AND t.[IsActive] = 1
        ORDER BY t.[SequenceOrder]
        FOR XML PATH('')
    ), 1, 2, '') AS TouchpointNumbers
FROM [dbo].[Indicators] i
WHERE i.[IsActive] = 1
GO

-- ================================================
-- Triggers for Automatic Sequence Management
-- ================================================

-- Trigger to update ModifiedDate on Projects
CREATE TRIGGER [TR_Projects_UpdateModifiedDate]
    ON [dbo].[Projects]
    AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[Projects]
    SET [ModifiedDate] = GETUTCDATE()
    WHERE [Id] IN (SELECT [Id] FROM inserted)
END
GO

-- Trigger to update ModifiedDate on Outcomes
CREATE TRIGGER [TR_Outcomes_UpdateModifiedDate]
    ON [dbo].[Outcomes]
    AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[Outcomes]
    SET [ModifiedDate] = GETUTCDATE()
    WHERE [Id] IN (SELECT [Id] FROM inserted)
END
GO

-- Trigger to update ModifiedDate on Touchpoints
CREATE TRIGGER [TR_Touchpoints_UpdateModifiedDate]
    ON [dbo].[Touchpoints]
    AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[Touchpoints]
    SET [ModifiedDate] = GETUTCDATE()
    WHERE [Id] IN (SELECT [Id] FROM inserted)
END
GO

-- Trigger to update ModifiedDate on Indicators
CREATE TRIGGER [TR_Indicators_UpdateModifiedDate]
    ON [dbo].[Indicators]
    AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[Indicators]
    SET [ModifiedDate] = GETUTCDATE()
    WHERE [Id] IN (SELECT [Id] FROM inserted)
END
GO

-- ================================================
-- Sample Data (Optional - for testing)
-- ================================================

-- Insert sample project
DECLARE @SampleProjectId UNIQUEIDENTIFIER = NEWID();

INSERT INTO [dbo].[Projects] ([Id], [Name], [Reference])
VALUES (@SampleProjectId, 'Sample Project', 'SP-001');

-- Insert sample outcomes
DECLARE @Outcome1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Outcome2Id UNIQUEIDENTIFIER = NEWID();

INSERT INTO [dbo].[Outcomes] ([Id], [ProjectId], [Heading], [Description], [SequenceOrder])
VALUES
    (@Outcome1Id, @SampleProjectId, 'Improve Customer Satisfaction', 'Increase overall customer satisfaction scores', 1),
    (@Outcome2Id, @SampleProjectId, 'Reduce Response Time', 'Decrease average response time to customer inquiries', 2);

-- Insert sample touchpoints
DECLARE @Touchpoint1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Touchpoint2Id UNIQUEIDENTIFIER = NEWID();

INSERT INTO [dbo].[Touchpoints] ([Id], [ProjectId], [Heading], [Description], [SequenceOrder])
VALUES
    (@Touchpoint1Id, @SampleProjectId, 'Customer Support Portal', 'Online support system implementation', 1),
    (@Touchpoint2Id, @SampleProjectId, 'Training Program', 'Staff training on new procedures', 2);

-- Insert sample indicator
DECLARE @IndicatorId UNIQUEIDENTIFIER = NEWID();

INSERT INTO [dbo].[Indicators] ([Id], [ProjectId], [Description], [Baseline])
VALUES (@IndicatorId, @SampleProjectId, 'Customer satisfaction rating (1-10 scale)', '6.5');

-- Link indicator to outcomes and touchpoints
INSERT INTO [dbo].[IndicatorOutcomes] ([IndicatorId], [OutcomeId])
VALUES (@IndicatorId, @Outcome1Id);

INSERT INTO [dbo].[IndicatorTouchpoints] ([IndicatorId], [TouchpointId])
VALUES
    (@IndicatorId, @Touchpoint1Id),
    (@IndicatorId, @Touchpoint2Id);

-- ================================================
-- Security and Permissions (Optional)
-- ================================================

-- Create roles for different access levels
CREATE ROLE [ProjectPlanningReader];
CREATE ROLE [ProjectPlanningWriter];
CREATE ROLE [ProjectPlanningAdmin];

-- Grant permissions
GRANT SELECT ON SCHEMA::[dbo] TO [ProjectPlanningReader];
GRANT SELECT, INSERT, UPDATE ON SCHEMA::[dbo] TO [ProjectPlanningWriter];
GRANT ALL ON SCHEMA::[dbo] TO [ProjectPlanningAdmin];

GO