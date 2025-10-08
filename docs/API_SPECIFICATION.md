# LDA Outcomes Tool - API Specification

## Overview

**Base URL**: `https://your-domain.com/api/v1`
**Protocol**: HTTPS only
**Authentication**: Bearer JWT token (obtained via Microsoft Entra ID)
**Content-Type**: `application/json`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Projects API](#projects-api)
3. [Outcomes API](#outcomes-api)
4. [Touchpoints API](#touchpoints-api)
5. [Indicators API](#indicators-api)
6. [Relationships API](#relationships-api)
7. [Decisions API](#decisions-api)
8. [Evaluations API](#evaluations-api)
9. [Reviews API](#reviews-api)
10. [Error Responses](#error-responses)

---

## Authentication

### POST /auth/login
Initiate Microsoft Entra ID authentication flow.

**Request:**
```http
POST /api/v1/auth/login
```

**Response:** Redirect to Microsoft Entra ID login page

---

### GET /auth/callback
Handle OAuth callback from Entra ID.

**Request:**
```http
GET /api/v1/auth/callback?code={authorization_code}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresIn": 28800,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "contributor"
    }
  }
}
```

---

### GET /auth/me
Get current authenticated user information.

**Request:**
```http
GET /api/v1/auth/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "contributor",
    "lastLogin": "2024-10-08T12:00:00Z"
  }
}
```

---

### POST /auth/logout
End user session.

**Request:**
```http
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Projects API

### GET /projects
List all projects with pagination, search, and sorting.

**Request:**
```http
GET /api/v1/projects?page=1&pageSize=25&search=project&sortBy=createdAt&sortOrder=desc
Authorization: Bearer {token}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| pageSize | integer | No | Items per page (10/25/50/100, default: 25) |
| search | string | No | Search by name or reference |
| sortBy | string | No | Sort field (name/reference/createdAt) |
| sortOrder | string | No | Sort direction (asc/desc) |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Customer Portal Redesign",
        "reference": "PROJ-2024-001",
        "createdBy": {
          "id": "uuid",
          "displayName": "John Doe"
        },
        "createdAt": "2024-10-01T10:00:00Z",
        "updatedAt": "2024-10-08T12:00:00Z",
        "outcomeCount": 5,
        "touchpointCount": 8,
        "indicatorCount": 12,
        "decisionCount": 3,
        "evaluationCount": 2
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "totalItems": 47,
      "totalPages": 2
    }
  }
}
```

---

### GET /projects/:id
Get specific project details.

**Request:**
```http
GET /api/v1/projects/{projectId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Customer Portal Redesign",
    "reference": "PROJ-2024-001",
    "createdBy": {
      "id": "uuid",
      "displayName": "John Doe",
      "email": "john.doe@example.com"
    },
    "createdAt": "2024-10-01T10:00:00Z",
    "updatedAt": "2024-10-08T12:00:00Z",
    "isActive": true
  }
}
```

---

### POST /projects
Create new project.

**Request:**
```http
POST /api/v1/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Customer Portal Redesign",
  "reference": "PROJ-2024-001"
}
```

**Validation Rules:**
- `name`: Required, 1-255 characters
- `reference`: Required, unique, 1-100 characters

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Customer Portal Redesign",
    "reference": "PROJ-2024-001",
    "createdBy": {
      "id": "uuid",
      "displayName": "John Doe"
    },
    "createdAt": "2024-10-08T12:00:00Z",
    "updatedAt": "2024-10-08T12:00:00Z",
    "isActive": true
  }
}
```

---

### PUT /projects/:id
Update existing project.

**Request:**
```http
PUT /api/v1/projects/{projectId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Customer Portal Redesign v2",
  "reference": "PROJ-2024-001"
}
```

**Authorization:** User must be project creator, manager, or administrator

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Customer Portal Redesign v2",
    "reference": "PROJ-2024-001",
    "updatedAt": "2024-10-08T13:00:00Z"
  }
}
```

---

### DELETE /projects/:id
Soft delete project.

**Request:**
```http
DELETE /api/v1/projects/{projectId}
Authorization: Bearer {token}
```

**Authorization:** User must be project creator, manager, or administrator

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Outcomes API

### GET /projects/:projectId/outcomes
List all outcomes for a project.

**Request:**
```http
GET /api/v1/projects/{projectId}/outcomes
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "heading": "Improve customer satisfaction",
      "description": "Increase overall customer satisfaction scores",
      "sequenceOrder": 1,
      "letter": "A",
      "createdAt": "2024-10-01T10:00:00Z",
      "updatedAt": "2024-10-01T10:00:00Z"
    },
    {
      "id": "uuid",
      "projectId": "uuid",
      "heading": "Reduce response time",
      "description": null,
      "sequenceOrder": 2,
      "letter": "B",
      "createdAt": "2024-10-01T10:05:00Z",
      "updatedAt": "2024-10-01T10:05:00Z"
    }
  ]
}
```

---

### POST /projects/:projectId/outcomes
Create new outcome.

**Request:**
```http
POST /api/v1/projects/{projectId}/outcomes
Authorization: Bearer {token}
Content-Type: application/json

{
  "heading": "Improve customer satisfaction",
  "description": "Increase overall customer satisfaction scores"
}
```

**Validation Rules:**
- `heading`: Required, 1-500 characters
- `description`: Optional, max 5000 characters

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "heading": "Improve customer satisfaction",
    "description": "Increase overall customer satisfaction scores",
    "sequenceOrder": 3,
    "letter": "C",
    "createdAt": "2024-10-08T12:00:00Z",
    "updatedAt": "2024-10-08T12:00:00Z"
  }
}
```

---

### POST /projects/:projectId/outcomes/bulk
Bulk create outcomes.

**Request:**
```http
POST /api/v1/projects/{projectId}/outcomes/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "outcomes": [
    {"heading": "Improve customer satisfaction"},
    {"heading": "Reduce response time"},
    {"heading": "Enhance user experience"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "created": 3,
    "outcomes": [
      {
        "id": "uuid",
        "heading": "Improve customer satisfaction",
        "sequenceOrder": 1,
        "letter": "A"
      },
      // ... additional outcomes
    ]
  }
}
```

---

### PUT /outcomes/:id
Update outcome.

**Request:**
```http
PUT /api/v1/outcomes/{outcomeId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "heading": "Significantly improve customer satisfaction",
  "description": "Increase customer satisfaction scores by 20%"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "heading": "Significantly improve customer satisfaction",
    "description": "Increase customer satisfaction scores by 20%",
    "updatedAt": "2024-10-08T13:00:00Z"
  }
}
```

---

### DELETE /outcomes/:id
Delete outcome (triggers re-sequencing).

**Request:**
```http
DELETE /api/v1/outcomes/{outcomeId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Outcome deleted successfully"
}
```

---

## Touchpoints API

### GET /projects/:projectId/touchpoints
List all touchpoints for a project.

**Request:**
```http
GET /api/v1/projects/{projectId}/touchpoints
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "heading": "Customer Support Portal",
      "description": "Online support system implementation",
      "sequenceOrder": 1,
      "number": "TP1",
      "createdAt": "2024-10-01T10:00:00Z",
      "updatedAt": "2024-10-01T10:00:00Z"
    }
  ]
}
```

---

### POST /projects/:projectId/touchpoints
Create new touchpoint.

**Request:**
```http
POST /api/v1/projects/{projectId}/touchpoints
Authorization: Bearer {token}
Content-Type: application/json

{
  "heading": "Customer Support Portal",
  "description": "Online support system implementation"
}
```

**Validation Rules:**
- `heading`: Required, 1-500 characters
- `description`: Optional, max 5000 characters

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "heading": "Customer Support Portal",
    "description": "Online support system implementation",
    "sequenceOrder": 1,
    "number": "TP1",
    "createdAt": "2024-10-08T12:00:00Z",
    "updatedAt": "2024-10-08T12:00:00Z"
  }
}
```

---

### POST /projects/:projectId/touchpoints/bulk
Bulk create touchpoints.

**Request:**
```http
POST /api/v1/projects/{projectId}/touchpoints/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "touchpoints": [
    {
      "heading": "Customer Support Portal",
      "description": "Online support system"
    },
    {
      "heading": "Training Program",
      "description": "Staff training sessions"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "created": 2,
    "touchpoints": [...]
  }
}
```

---

### PUT /touchpoints/:id
Update touchpoint.

**Request:**
```http
PUT /api/v1/touchpoints/{touchpointId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "heading": "Enhanced Customer Support Portal",
  "description": "New features added to online support system"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "heading": "Enhanced Customer Support Portal",
    "description": "New features added to online support system",
    "updatedAt": "2024-10-08T13:00:00Z"
  }
}
```

---

### DELETE /touchpoints/:id
Delete touchpoint (triggers re-numbering).

**Request:**
```http
DELETE /api/v1/touchpoints/{touchpointId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Touchpoint deleted successfully"
}
```

---

## Indicators API

### GET /projects/:projectId/indicators
List all indicators with relationships.

**Request:**
```http
GET /api/v1/projects/{projectId}/indicators
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "description": "Customer satisfaction rating (1-10 scale)",
      "baseline": "6.5",
      "finalValue": null,
      "outcomes": [
        {"id": "uuid", "letter": "A", "heading": "Improve customer satisfaction"}
      ],
      "touchpoints": [
        {"id": "uuid", "number": "TP1", "heading": "Customer Support Portal"}
      ],
      "createdAt": "2024-10-01T10:00:00Z",
      "updatedAt": "2024-10-01T10:00:00Z"
    }
  ]
}
```

---

### POST /projects/:projectId/indicators
Create new indicator.

**Request:**
```http
POST /api/v1/projects/{projectId}/indicators
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Customer satisfaction rating (1-10 scale)",
  "baseline": "6.5",
  "outcomeIds": ["uuid1", "uuid2"],
  "touchpointIds": ["uuid3", "uuid4"]
}
```

**Validation Rules:**
- `description`: Required, 1-1000 characters
- `baseline`: Optional, 1-255 characters
- `outcomeIds`: Optional array of UUIDs
- `touchpointIds`: Optional array of UUIDs

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "description": "Customer satisfaction rating (1-10 scale)",
    "baseline": "6.5",
    "finalValue": null,
    "outcomes": [...],
    "touchpoints": [...],
    "createdAt": "2024-10-08T12:00:00Z",
    "updatedAt": "2024-10-08T12:00:00Z"
  }
}
```

---

### POST /projects/:projectId/indicators/bulk
Bulk create indicators.

**Request:**
```http
POST /api/v1/projects/{projectId}/indicators/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "indicators": [
    {
      "description": "Customer satisfaction rating",
      "baseline": "6.5"
    },
    {
      "description": "Average response time",
      "baseline": "24 hours"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "created": 2,
    "indicators": [...]
  }
}
```

---

### PUT /indicators/:id
Update indicator.

**Request:**
```http
PUT /api/v1/indicators/{indicatorId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Customer satisfaction rating (1-10 scale) - Updated",
  "baseline": "6.8",
  "finalValue": "8.5"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "description": "Customer satisfaction rating (1-10 scale) - Updated",
    "baseline": "6.8",
    "finalValue": "8.5",
    "updatedAt": "2024-10-08T13:00:00Z"
  }
}
```

---

### DELETE /indicators/:id
Delete indicator.

**Request:**
```http
DELETE /api/v1/indicators/{indicatorId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Indicator deleted successfully"
}
```

---

## Relationships API

### GET /indicators/:id/relationships
Get indicator relationships.

**Request:**
```http
GET /api/v1/indicators/{indicatorId}/relationships
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "indicatorId": "uuid",
    "outcomes": [
      {"id": "uuid", "letter": "A", "heading": "Improve customer satisfaction"}
    ],
    "touchpoints": [
      {"id": "uuid", "number": "TP1", "heading": "Customer Support Portal"}
    ]
  }
}
```

---

### PUT /indicators/:id/relationships
Update indicator relationships.

**Request:**
```http
PUT /api/v1/indicators/{indicatorId}/relationships
Authorization: Bearer {token}
Content-Type: application/json

{
  "outcomeIds": ["uuid1", "uuid2"],
  "touchpointIds": ["uuid3", "uuid4", "uuid5"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "indicatorId": "uuid",
    "outcomes": [...],
    "touchpoints": [...]
  }
}
```

---

### GET /projects/:projectId/relationships/matrix
Get relationship matrix view data.

**Request:**
```http
GET /api/v1/projects/{projectId}/relationships/matrix
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "indicators": [
      {
        "id": "uuid",
        "description": "Customer satisfaction rating",
        "outcomeIds": ["uuid1", "uuid2"],
        "touchpointIds": ["uuid3", "uuid4"]
      }
    ],
    "outcomes": [
      {"id": "uuid1", "letter": "A", "heading": "..."}
    ],
    "touchpoints": [
      {"id": "uuid3", "number": "TP1", "heading": "..."}
    ]
  }
}
```

---

## Decisions API

### GET /projects/:projectId/decisions
List all decisions for a project.

**Request:**
```http
GET /api/v1/projects/{projectId}/decisions
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "referenceNumber": "DEC-001",
      "decisionDate": "2024-10-05",
      "topic": "Technology Stack",
      "status": "approved",
      "decisionDescription": "Adopt Vue.js for frontend",
      "decisionJustification": "Better developer experience and performance",
      "furtherActions": "Train team on Vue.js",
      "overallImpact": "Positive impact on development velocity",
      "outcomeImpacts": [
        {
          "outcomeId": "uuid",
          "outcomeLetter": "A",
          "trend": "positive",
          "impactDescription": "Faster feature delivery"
        }
      ],
      "createdBy": {
        "id": "uuid",
        "displayName": "John Doe"
      },
      "createdAt": "2024-10-05T10:00:00Z",
      "updatedAt": "2024-10-05T10:00:00Z"
    }
  ]
}
```

---

### POST /projects/:projectId/decisions
Create new decision.

**Request:**
```http
POST /api/v1/projects/{projectId}/decisions
Authorization: Bearer {token}
Content-Type: application/json

{
  "referenceNumber": "DEC-001",
  "decisionDate": "2024-10-05",
  "topic": "Technology Stack",
  "status": "approved",
  "decisionDescription": "Adopt Vue.js for frontend",
  "decisionJustification": "Better developer experience",
  "furtherActions": "Train team on Vue.js",
  "overallImpact": "Positive impact on development velocity",
  "outcomeImpacts": [
    {
      "outcomeId": "uuid",
      "trend": "positive",
      "impactDescription": "Faster feature delivery"
    }
  ]
}
```

**Validation Rules:**
- `status`: Must be one of: pending, approved, implemented, reviewed, cancelled
- `outcomeImpacts[].trend`: Must be one of: positive, neutral, negative

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "referenceNumber": "DEC-001",
    "decisionDate": "2024-10-05",
    "status": "approved",
    // ... full decision object
    "createdAt": "2024-10-08T12:00:00Z"
  }
}
```

---

### PUT /decisions/:id
Update decision.

**Request:**
```http
PUT /api/v1/decisions/{decisionId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "implemented",
  "furtherActions": "Training completed, all developers onboarded"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "implemented",
    "furtherActions": "Training completed, all developers onboarded",
    "updatedAt": "2024-10-08T13:00:00Z"
  }
}
```

---

### DELETE /decisions/:id
Delete decision.

**Request:**
```http
DELETE /api/v1/decisions/{decisionId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Decision deleted successfully"
}
```

---

### GET /projects/:projectId/decisions/export
Export decisions to CSV.

**Request:**
```http
GET /api/v1/projects/{projectId}/decisions/export
Authorization: Bearer {token}
```

**Response:** CSV file download
```
Content-Type: text/csv
Content-Disposition: attachment; filename="decisions_PROJ-2024-001_20241008.csv"

Ref No,Date,Topic,Status,Decision,Justification,...
DEC-001,2024-10-05,Technology Stack,approved,Adopt Vue.js,...
```

---

## Evaluations API

### GET /projects/:projectId/evaluations
List all evaluations for a project.

**Request:**
```http
GET /api/v1/projects/{projectId}/evaluations
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "touchpoint": {
        "id": "uuid",
        "number": "TP1",
        "heading": "Customer Support Portal"
      },
      "decisionMakingEvaluation": "Outcomes significantly influenced...",
      "outcomeProgress": [
        {
          "outcome": {
            "id": "uuid",
            "letter": "A",
            "heading": "Improve customer satisfaction"
          },
          "statusDescription": "Good progress made",
          "trend": "positive",
          "evidence": "Survey results show 15% improvement"
        }
      ],
      "actionItems": [
        {
          "id": "uuid",
          "description": "Follow up with dissatisfied customers",
          "priority": "high",
          "dueDate": "2024-10-15",
          "status": "pending"
        }
      ],
      "evaluatedBy": {
        "id": "uuid",
        "displayName": "Jane Smith"
      },
      "evaluatedAt": "2024-10-07T14:00:00Z"
    }
  ]
}
```

---

### GET /touchpoints/:touchpointId/evaluation
Get evaluation for specific touchpoint.

**Request:**
```http
GET /api/v1/touchpoints/{touchpointId}/evaluation
Authorization: Bearer {token}
```

**Response:** Same structure as above, single evaluation object

---

### POST /touchpoints/:touchpointId/evaluation
Create or update touchpoint evaluation.

**Request:**
```http
POST /api/v1/touchpoints/{touchpointId}/evaluation
Authorization: Bearer {token}
Content-Type: application/json

{
  "decisionMakingEvaluation": "Outcomes significantly influenced our approach...",
  "outcomeProgress": [
    {
      "outcomeId": "uuid",
      "statusDescription": "Good progress made",
      "trend": "positive",
      "evidence": "Survey results show 15% improvement"
    }
  ]
}
```

**Validation Rules:**
- `outcomeProgress[].trend`: Must be one of: positive, neutral, negative

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "touchpointId": "uuid",
    "decisionMakingEvaluation": "...",
    "outcomeProgress": [...],
    "actionItems": [],
    "evaluatedAt": "2024-10-08T12:00:00Z"
  }
}
```

---

### POST /evaluations/:evaluationId/actions
Add action item to evaluation.

**Request:**
```http
POST /api/v1/evaluations/{evaluationId}/actions
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Follow up with dissatisfied customers",
  "priority": "high",
  "dueDate": "2024-10-15"
}
```

**Validation Rules:**
- `description`: Required, 1-1000 characters
- `priority`: Must be one of: low, medium, high
- `dueDate`: Optional, ISO date format

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "description": "Follow up with dissatisfied customers",
    "priority": "high",
    "dueDate": "2024-10-15",
    "status": "pending",
    "createdAt": "2024-10-08T12:00:00Z"
  }
}
```

---

### PUT /actions/:actionId
Update action item.

**Request:**
```http
PUT /api/v1/actions/{actionId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "description": "Followed up with all dissatisfied customers"
}
```

**Validation Rules:**
- `status`: Must be one of: pending, in_progress, completed

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "description": "Followed up with all dissatisfied customers",
    "status": "completed",
    "completedAt": "2024-10-08T12:00:00Z",
    "updatedAt": "2024-10-08T12:00:00Z"
  }
}
```

---

### DELETE /actions/:actionId
Delete action item.

**Request:**
```http
DELETE /api/v1/actions/{actionId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Action item deleted successfully"
}
```

---

### GET /projects/:projectId/evaluations/export
Export evaluations to CSV.

**Request:**
```http
GET /api/v1/projects/{projectId}/evaluations/export
Authorization: Bearer {token}
```

**Response:** CSV file download

---

## Reviews API

### GET /projects/:projectId/review
Get final review for project.

**Request:**
```http
GET /api/v1/projects/{projectId}/review
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "projectReflection": "The project was successful overall...",
    "changeAnalysis": "Key findings include...",
    "lessonsLearnt": "We learned that...",
    "standoutStats": "Achieved 25% improvement in customer satisfaction",
    "finalOutcomeEvaluations": [
      {
        "outcome": {
          "id": "uuid",
          "letter": "A",
          "heading": "Improve customer satisfaction"
        },
        "achievementDescription": "Successfully improved satisfaction by 25%",
        "overallAssessment": "Exceeded expectations"
      }
    ],
    "indicators": [
      {
        "id": "uuid",
        "description": "Customer satisfaction rating",
        "baseline": "6.5",
        "finalValue": "8.1"
      }
    ],
    "reviewedBy": {
      "id": "uuid",
      "displayName": "John Doe"
    },
    "reviewedAt": "2024-10-08T15:00:00Z"
  }
}
```

---

### POST /projects/:projectId/review
Create or update final review.

**Request:**
```http
POST /api/v1/projects/{projectId}/review
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectReflection": "The project was successful overall...",
  "changeAnalysis": "Key findings include...",
  "lessonsLearnt": "We learned that...",
  "standoutStats": "Achieved 25% improvement",
  "outcomeEvaluations": [
    {
      "outcomeId": "uuid",
      "achievementDescription": "Successfully improved satisfaction by 25%",
      "overallAssessment": "Exceeded expectations"
    }
  ],
  "indicatorFinalValues": [
    {
      "indicatorId": "uuid",
      "finalValue": "8.1"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "projectReflection": "...",
    // ... full review object
    "reviewedAt": "2024-10-08T15:00:00Z"
  }
}
```

---

### GET /projects/:projectId/review/report
Generate PDF final report.

**Request:**
```http
GET /api/v1/projects/{projectId}/review/report
Authorization: Bearer {token}
```

**Response:** PDF file download
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="LDA_Outcomes_Final_Report_PROJ-2024-001.pdf"

[Binary PDF content]
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details (optional)
    }
  }
}
```

### HTTP Status Codes

| Status Code | Meaning | When Used |
|-------------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST creating resource |
| 400 | Bad Request | Validation errors, malformed request |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User lacks permissions for action |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource (e.g., project reference) |
| 422 | Unprocessable Entity | Business logic validation failed |
| 500 | Internal Server Error | Server-side error |

### Common Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| UNAUTHORIZED | 401 | Authentication required or token invalid |
| FORBIDDEN | 403 | User lacks required permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Input validation failed |
| DUPLICATE_RESOURCE | 409 | Resource already exists |
| BUSINESS_LOGIC_ERROR | 422 | Business rule violation |
| DATABASE_ERROR | 500 | Database operation failed |
| INTERNAL_ERROR | 500 | Unexpected server error |

### Example Error Responses

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "name": ["Name is required"],
      "reference": ["Reference must be unique"]
    }
  }
}
```

**Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Project not found",
    "details": {
      "projectId": "123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

**Forbidden:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to edit this project",
    "details": {
      "requiredRole": "manager",
      "userRole": "reader"
    }
  }
}
```

---

## Rate Limiting

- **Rate Limit**: 1000 requests per hour per user
- **Headers**:
  - `X-RateLimit-Limit`: 1000
  - `X-RateLimit-Remaining`: 950
  - `X-RateLimit-Reset`: 1696780800 (Unix timestamp)

When rate limit exceeded:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "resetAt": "2024-10-08T13:00:00Z"
    }
  }
}
```

---

## Pagination

For list endpoints that support pagination:

**Request:**
```http
GET /api/v1/projects?page=2&pageSize=25
```

**Response includes:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 2,
      "pageSize": 25,
      "totalItems": 100,
      "totalPages": 4,
      "hasNextPage": true,
      "hasPreviousPage": true
    }
  }
}
```

---

## API Versioning

- Current version: `v1`
- Version included in URL path: `/api/v1/...`
- Breaking changes will result in new version: `/api/v2/...`
- Previous versions supported for minimum 6 months after deprecation notice

---

## Document Information

**Version**: 1.0
**Last Updated**: 2024-10-08
**API Base URL**: `https://your-domain.com/api/v1`
**OpenAPI/Swagger**: Available at `https://your-domain.com/api/swagger`
