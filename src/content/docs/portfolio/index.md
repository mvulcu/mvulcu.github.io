---
title: Maria Vulcu | DevOps Engineer
description: Cloud-native portfolio with live monitoring, CI/CD, and Infrastructure as Code
icon: material/rocket-launch
status: new
---

# Maria Vulcu | DevOps Engineer Portfolio { .text-center }

<div class="grid cards" markdown>

-   :material-cloud-outline:{ .lg .middle } __Cloud Native Application__

    ---

    Not just a portfolio – a fully-fledged cloud application with real-time monitoring, automated deployments, and infrastructure as code

    [:octicons-arrow-right-24: View Live Demo](https://grepme.dev){ .md-button }

-   :material-chart-line:{ .lg .middle } __Live Monitoring Dashboard__

    ---

    Real-time metrics visualization showcasing uptime, latency, and resource usage with beautiful charts
    <br>
    <br>
    
    [:octicons-graph-24: Check Health Status](https://grepme.dev/api/health){ .md-button .md-button--primary }

</div>

## :material-lightning-bolt: Quick Overview

!!! example "Live Production Environment"
    
    🚀 **Production URL:** [grepme.dev](https://grepme.dev)
    
    📊 **Monitoring API:** [Health Check Endpoint](https://grepme.dev/api/health)

!!! info "Platform Evolution Journey"
    
    🌤️ **Originally deployed on Microsoft Azure** with comprehensive Bicep IaC templates
    
    ☁️ **Migrated to Google Cloud Platform** in October 2024 for cost optimization and performance improvements
    
    [:material-cloud-sync: View Migration Story](migration.md){ .md-button }
       
## :material-stack-overflow: Tech Stack

=== "Frontend"

    ```yaml
    Framework: Next.js 14
    Language: TypeScript
    Styling: Tailwind CSS
    Animations: Framer Motion
    Charts: Recharts
    ```

=== "Backend & Cloud"

    ```yaml
    API: Next.js API Routes
    Functions: Azure Functions (Node.js)
    Platform: Microsoft Azure
    Container: Docker
    ```

=== "DevOps"

    ```yaml
    CI/CD: GitHub Actions
    IaC: Azure Bicep
    Monitoring: Application Insights
    Analytics: Custom Azure Functions
    ```

## :material-star-shooting: Key Features

<div class="annotate" markdown>

- :material-monitor-dashboard: **Live Monitoring Dashboard** (1)
- :material-github: **Automated CI/CD Pipelines** (2)
- :material-terraform: **Infrastructure as Code** (3)
- :material-docker: **Containerized Application** (4)
- :material-theme-light-dark: **Light/Dark Mode**
- :material-shield-check: **GDPR Compliant**
- :material-responsive: **Fully Responsive**
- :material-google-analytics: **Analytics Integration**

</div>

1. Real-time display of application health metrics including uptime, latency, and memory usage
2. Automated build, test, and deployment workflows for both application and infrastructure
3. Azure resources managed declaratively using Bicep templates
4. Next.js app containerized with Docker and deployed to Azure App Service

## :material-rocket: Getting Started

### Prerequisites

!!! info "Required Tools"
    - [x] Node.js v20+
    - [x] pnpm package manager
    - [x] Docker (for containerization)
    - [x] Azure CLI (for deployment)

### :material-laptop: Local Development

=== "Clone & Install"

    ```bash
    # Clone the repository
    git clone https://github.com/mvulcu/devops-portfolio.git
    cd devops-portfolio

    # Install dependencies
    pnpm install
    ```

=== "Development Server"

    ```bash
    # Start development server
    pnpm dev

    # Application available at http://localhost:3000
    ```

=== "Production Build"

    ```bash
    # Build for production
    pnpm build

    # Start production server
    pnpm start
    ```

### :material-cloud-upload: Deploy to Azure

!!! tip "Infrastructure as Code Deployment"
    All Azure resources are defined in Bicep templates for reproducible deployments

=== "Production Environment"

    ```bash
    cd infra
    
    az deployment group create \
      --resource-group your-resource-group-name \
      --template-file ./main.bicep \
      --parameters ./parameters/prod.bicepparam
    ```

=== "Development Environment"

    ```bash
    cd infra
    
    az deployment group create \
      --resource-group your-resource-group-name \
      --template-file ./main.bicep \
      --parameters ./parameters/dev.bicepparam
    ```

## :material-chart-line: Monitoring Architecture

```mermaid
graph LR
    A[Portfolio App] -->|Health Check| B[Azure Function]
    B -->|Metrics| C[Monitoring API]
    C -->|JSON Data| D[Frontend Dashboard]
    A -->|Telemetry| E[Application Insights]
    
    style A fill:#0066cc,stroke:#ffffff,stroke-width:2px,color:#ffffff
    style B fill:#00a86b,stroke:#ffffff,stroke-width:2px,color:#ffffff
    style C fill:#ff6b6b,stroke:#ffffff,stroke-width:2px,color:#ffffff
    style D fill:#845ec2,stroke:#ffffff,stroke-width:2px,color:#ffffff
    style E fill:#ff9671,stroke:#ffffff,stroke-width:2px,color:#ffffff
```

### Metrics Collected

<div class="grid" markdown>

:material-clock-check:{ .lg } **Uptime**
: Application availability percentage

:material-speedometer:{ .lg } **Latency**
: API response time in milliseconds

:material-memory:{ .lg } **Memory**
: Heap usage and percentage

:material-chart-timeline:{ .lg } **Trends**
: Historical performance data

</div>

## :material-pipe: CI/CD Pipeline

```mermaid
graph TD
    %% Начало процесса
    A[Code Push] --> B{Branch?}

    %% Основные ветки
    B -->|dev| D[Run Tests]
    B -->|PR| E[Pull Request]

    %% PR-пайплайн
    E --> E1[Lint]
    E1 --> E2[Unit Tests]
    E2 --> E3[Integration Tests]
    E3 --> E4[Build]
    E4 --> E5{Tests Passed?}
    E5 -->|Yes| E6[Merge to Main]
    E5 -->|No| EX[Fix Issues]

    %% Ветка dev
    D --> D1[Image Scan]
    D1 --> D2[Deploy to Dev Environment]
    D2 --> D3[Monitor & Health Check]
    D3 --> D4{Health Check Passed?}
    D4 -->|No| D5[Rollback to previous stable build]
    D4 -->|Yes| D6[Ready for PR]
    D6 --> E[Pull Request]

    %% Production Pipeline (только после merge в main)
    E6 --> C[Production Pipeline]
    C --> C1[Build Image]
    C1 --> C2[Image Scan]
    C2 --> C3[Tag & Push to GHCR]
    C3 --> C4[Deploy to Production Environment]
    C4 --> C5[Monitor & Health Check]
    C5 --> C6{Health Check Passed?}
    C6 -->|No| C7[Rollback to previous stable build]
    C6 -->|Yes| C8[Production Stable]

    %% Стили узлов
    classDef start fill:#9da8b0,color:#fff,stroke:#000,stroke-width:2px
    classDef action fill:#4d7bff,color:#fff
    classDef decision fill:#ffa348,color:#000
    classDef final fill:#44c767,color:#fff
    classDef fail fill:#e0493f,color:#fff
    classDef monitor fill:#6c60d0,color:#fff

    class A,B start
    class C,D,E,E1,E2,E3,E4,D1,D2,C1,C2,C3,C4 action
    class B,E5,D4,C6 decision
    class E6,D6,C8 final
    class EX,D5,C7 fail
    class D3,C5 monitor


```

<div class="text-center" markdown>

**DevOps Portfolio Evolution Journey**

[:material-microsoft-azure: Original Azure Architecture](deployment.md){ .md-button }
[:material-cloud-sync: Migration to GCP](migration.md){ .md-button .md-button--primary }
[:material-monitor-dashboard: Monitoring Strategy](monitoring.md){ .md-button }

---

**Built with** :material-heart: **by Maria Vulcu**

[:material-github: GitHub](https://github.com/mvulcu){ .md-button .md-button--primary }
[:material-linkedin: LinkedIn](https://www.linkedin.com/in/mariavulcu){ .md-button }
[:material-email: Contact](#){ .md-button }

</div>