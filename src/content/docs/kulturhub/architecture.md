---
title: System Architecture
description: Complete architectural overview of KulturHub platform
icon: material/layers-triple
---

#  System Architecture

## Overview

KulturHub implements a modern cloud-native architecture designed for scalability, security, and maintainability. The system follows microservices principles while maintaining cost efficiency for educational purposes.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile Browser]
    end
    
    subgraph "Application Layer"
        C[Next.js Frontend<br/>React + TypeScript]
        D[API Routes<br/>Server-Side Logic]
        E[Static Assets<br/>CDN-Ready]
    end
    
    subgraph "Service Layer"
        F[Authentication<br/>JWT + RBAC]
        G[Business Logic<br/>Event Management]
        H[Email Service<br/>Azure Function]
    end
    
    subgraph "Data Layer"
        I[MongoDB Atlas<br/>Document Store]
        J[Azure Blob<br/>Image Storage]
        K[Stateless JWT<br/>HttpOnly Cookies]
    end
    
    subgraph "Infrastructure Layer"
        L[Docker Containers]
        M[Azure App Service]
        N[Virtual Network]
        O[Security Groups]
    end
    
    A --> C
    B --> C
    C --> D
    D --> F
    D --> G
    G --> H
    F --> I
    G --> I
    G --> J
    F --> K
    
    L --> M
    M --> N
    N --> O
    
    style C fill:#667eea,stroke:#fff,stroke-width:2px,color:#fff
    style I fill:#00a86b,stroke:#fff,stroke-width:2px,color:#fff
    style M fill:#0078d4,stroke:#fff,stroke-width:2px,color:#fff
```

:::note[Architectural Decision: Stateless Authentication over Redis]
To respect resource limits and reduce operational complexity under the **Azure for Students** tier, session state is managed completely statelessly via cryptographically signed JWTs stored in secure httpOnly cookies. This eliminated the need for a costly external Redis cluster while preserving horizontal scaling capabilities.

:::

## Component Architecture

### Frontend Architecture

The frontend uses Next.js 14 with the App Router for optimal performance and SE✅

**Key Technologies:**<br>
- **Framework:** Next.js 14 (App Router)<br>
- **Language:** TypeScript for type safety<br>
- **Styling:** Tailwind CSS for utility-first design<br>
- **Components:** shadcn/ui for consistent UI<br>
- **State Management:** React Context + Hooks<br>
- **Forms:** React Hook Form + Zod validation

**Directory Structure:**
```
app/
├── (auth)/          # Authentication pages
├── (public)/        # Public routes
├── admin/           # Admin dashboard
├── api/             # API routes
├── events/          # Event pages
└── profile/         # User profiles
```

### Backend Architecture

The backend leverages Next.js API routes with a clear separation of concerns.

**API Structure:**
```
api/
├── auth/            # Authentication endpoints
├── events/          # Event CRUD operations
├── users/           # User management
├── admin/           # Admin operations
└── notifications/   # Email triggers
```

**Key Features:**<br>
- RESTful API design<br>
- JWT-based authentication<br>
- Role-based access control<br>
- Request validation middleware<br>
- Error handling middleware<br>
- Rate limiting

### Database Design

MongoDB Atlas provides flexible document storage with the following collections:

```mermaid
erDiagram
    USERS ||--o{ EVENTS : creates
    USERS ||--o{ RSVPS : makes
    EVENTS ||--o{ RSVPS : has
    USERS ||--o{ APPLICATIONS : submits
    
    USERS {
        ObjectId _id
        string email
        string password_hash
        string name
        string role
        boolean isOrganizer
        Date createdAt
    }
    
    EVENTS {
        ObjectId _id
        string title
        string description
        Date date
        string location
        ObjectId organizerId
        string category
        number capacity
        string imageUrl
        array attendees
    }
    
    RSVPS {
        ObjectId _id
        ObjectId userId
        ObjectId eventId
        Date createdAt
        string status
    }
    
    APPLICATIONS {
        ObjectId _id
        ObjectId userId
        string reason
        string status
        Date createdAt
    }
```

## Network Architecture

### Original Azure-Native Design (Enterprise Blueprint)

:::tip[Evolution Note: Enterprise Blueprint vs Budget Realities]
The initial architectural blueprint envisioned Azure Front Door with Web Application Firewall (WAF) and Private Endpoints. Under the **Azure for Students** subscription constraints ( credit limit), Front Door (+/month) and Cosmos DB Private Endpoints (+/month) were streamlined. Security was transferred to application-level rate limiting, CORS whitelisting, MongoDB Atlas IP access lists, and Azure App Service platform TLS/DDoS protection.

:::

The initial implementation used comprehensive Azure networking:

```mermaid
graph LR
    subgraph "Internet"
        A[Users]
    end
    
    subgraph "Azure Front Door"
        B[WAF]
        C[CDN]
    end
    
    subgraph "Virtual Network"
        D[App Service<br/>Subnet]
        E[Database<br/>Subnet]
        F[Management<br/>Subnet]
    end
    
    subgraph "Private Endpoints"
        G[Cosmos DB PE]
        H[Storage PE]
    end
    
    A --> B
    B --> C
    C --> D
    D --> G
    D --> H
    E --> G
    F --> E
    
    style B fill:#ff6b6b,stroke:#fff,stroke-width:2px,color:#fff
    style D fill:#0078d4,stroke:#fff,stroke-width:2px,color:#fff
    style G fill:#00a86b,stroke:#fff,stroke-width:2px,color:#fff
```

### Optimized Architecture (Current)

Post-optimization, the network design focuses on simplicity:

```mermaid
graph LR
    A[Internet] --> B[Azure App Service]
    B --> C[MongoDB Atlas<br/>IP Whitelist]
    B --> D[Azure Blob<br/>Public Access]
    B --> E[SendGrid API<br/>HTTPS]
    
    style B fill:#0078d4,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#00a86b,stroke:#fff,stroke-width:2px,color:#fff
```

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant JWT
    participant MongoDB
    
    User->>Frontend: Login credentials
    Frontend->>API: POST /api/auth/login
    API->>MongoDB: Verify credentials
    MongoDB-->>API: User data
    API->>JWT: Generate token
    JWT-->>API: Signed token
    API-->>Frontend: Token + user info
    Frontend->>Frontend: Store in httpOnly cookie
    
    Note over Frontend: Subsequent requests
    Frontend->>API: Request + Cookie
    API->>JWT: Verify token
    JWT-->>API: Claims
    API-->>Frontend: Authorized response
```

### Security Layers

1. **Application Security**
   - JWT tokens with httpOnly cookies
   - CORS configuration
   - Input validation and sanitization
   - SQL injection prevention (MongoDB)
   - XSS protection headers

2. **Network Security**
   - HTTPS everywhere
   - IP whitelisting for database
   - Azure NSG rules
   - Private endpoints (original design)

3. **Data Security**
   - Passwords hashed with bcrypt
   - Environment variables for secrets
   - No sensitive data in logs
   - Encrypted data at rest

## Deployment Architecture

The runtime architecture is decoupled into lightweight, containerized microservices hosted on Azure App Service for Linux, enforcing clean dependency isolation and deterministic deployment steps.

### Container Strategy

```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### CI/CD Pipeline Architecture

```mermaid
graph LR
    subgraph "Development"
        A[Local Dev] --> B[Git Push]
    end
    
    subgraph "GitHub"
        B --> C[Actions Trigger]
        C --> D[Build & Test]
        D --> E[Docker Build]
    end
    
    subgraph "Registry"
        E --> F[GHCR Push]
        F --> G[Tagged Image]
    end
    
    subgraph "Deployment"
        G --> H[Azure Deploy]
        H --> I[App Service]
    end
    
    style C fill:#1f883d,stroke:#fff,stroke-width:2px,color:#fff
    style F fill:#1f883d,stroke:#fff,stroke-width:2px,color:#fff
    style I fill:#0078d4,stroke:#fff,stroke-width:2px,color:#fff
```

## Scalability Considerations

### Horizontal Scaling

The architecture supports horizontal scaling through:

- **Stateless application design**
- **Stateless session tokens (JWT in httpOnly cookies)**
- **Database connection pooling**
- **CDN for static assets**
- **Load balancer ready**

### Performance Optimizations

1. **Frontend Performance**
   - Next.js automatic code splitting
   - Image optimization with next/image
   - Static generation where possible
   - Client-side caching

2. **Backend Performance**
   - Connection pooling
   - Query optimization
   - Caching strategies
   - Async operations

3. **Database Performance**
   - Indexed queries
   - Aggregation pipelines
   - Connection limits
   - Query monitoring

---



[ Overview](index.md)
[ Infrastructure](infrastructure.md)


