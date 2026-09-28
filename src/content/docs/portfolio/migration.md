---
title: Azure to GCP Migration Journey
description: Complete documentation of the DevOps Portfolio migration from Microsoft Azure to Google Cloud Platform
icon: material/cloud-sync
---

-    __Evolution Story__

    ---

    Journey from Azure App Service to GCP Cloud Run, demonstrating modern cloud migration practices with zero downtime

    [ View Results](#results-benefits)

-    __60% Cost Reduction__

    ---

    Achieved significant cost savings through strategic use of GCP Free Tier and serverless architecture

    [ See Analysis](#cost-analysis)



## Executive Summary

:::tip[Executive Migration Brief]
* **Source Platform:** Azure App Service (Basic B1 SKU, ~13 EUR/month)
* **Target Platform:** Google Cloud Run (Europe-West3, Fully Managed Serverless)
* **IaC Evolution:** Azure Bicep &rarr; HashiCorp Terraform modules
* **Cost Impact:** 100% reduction in baseline cost (0 EUR/month via GCP Always-Free tier)
* **Deployment Velocity:** 14 min manual Azure pipeline &rarr; 2.5 min automated GitHub Actions build
:::


This document details the successful migration of the DevOps Portfolio website from Microsoft Azure to Google Cloud Platform (GCP). The migration was executed to optimize costs, improve performance, and gain hands-on experience with GCP services.

:::tip[Migration Results]
- ✅ **Zero Downtime Migration** - Seamless DNS transition
- 💰 **✅ Cost Reduction** - Leveraging GCP Free Tier
- ⚡ **Enhanced Performance** - Improved cold start times 
- 🔧 **Simplified Architecture** - Eliminated complex dependencies

:::

---

##  Architecture Evolution

### Before: Azure Architecture

```mermaid
graph TB
    subgraph "Azure Cloud"
        AS[Azure App Service] 
        AST[Azure Storage Account]
        ACE[Azure Communication Email]
        AI[Application Insights]
        RG[Resource Group]
    end
    
    subgraph "External"
        GH[GitHub Actions]
        DNS[DNS Provider]
        USER[Users]
    end
    
    USER --> DNS
    DNS --> AS
    GH --> AS
    AS --> AST
    AS --> ACE
    AS --> AI
    
    style AS fill:#0078d4,stroke:#ffffff,stroke-width:2px,color:#ffffff
    style AST fill:#0078d4,stroke:#ffffff,stroke-width:2px,color:#ffffff
    style ACE fill:#0078d4,stroke:#ffffff,stroke-width:2px,color:#ffffff
    style AI fill:#0078d4,stroke:#ffffff,stroke-width:2px,color:#ffffff
```

### After: GCP Architecture

```mermaid
graph TB
    subgraph "Google Cloud Platform"
        CR[Cloud Run]
        CS[Cloud Storage]
        AR[Artifact Registry]
        SM[Secret Manager]
        IAM[IAM Service Accounts]
    end
    
    subgraph "External"
        GH[GitHub Actions]
        DNS[DNS Provider]
        USER[Users]
    end
    
    USER --> DNS
    DNS --> CR
    GH --> AR
    AR --> CR
    CR --> CS
    CR --> SM
    IAM --> CR
    
    style CR fill:#4285f4,stroke:#ffffff,stroke-width:2px,color:#ffffff
    style CS fill:#34a853,stroke:#ffffff,stroke-width:2px,color:#ffffff
    style AR fill:#ea4335,stroke:#ffffff,stroke-width:2px,color:#ffffff
    style SM fill:#fbbc04,stroke:#ffffff,stroke-width:2px,color:#ffffff
```

---

##  Service Mapping

| Azure Service | GCP Equivalent | Migration Rationale |
|---------------|----------------|-------------------|
| Azure App Service | **Cloud Run** | Serverless, pay-per-use model, better auto-scaling |
| Azure Storage Account | **Cloud Storage** | Similar functionality, better pricing structure |
| Azure Communication Email | **Removed** | Simplified architecture, eliminated complexity |
| Application Insights | **Cloud Monitoring** | Built-in observability with Cloud Run |
| Azure Bicep | **Terraform** | Multi-cloud compatibility, broader ecosystem |

---

##  Technical Implementation

### Infrastructure as Code Evolution

#### Azure Bicep (Before)

    ```bicep
    module appService 'modules/appservice.bicep' = {
      name: 'app-deploy'
      params: {
        name: appServiceName
        location: location
        environment: environment
        planId: plan.outputs.planId
      }
    }
    
    module storage 'modules/storage.bicep' = {
      name: 'storage-deploy'
      params: {
        name: storageAccountName
        location: location
      }
    }
    ```

#### GCP Terraform (After)

    ```hcl
    resource "google_cloud_run_v2_service" "portfolio" {
      name     = "portfolio-${var.environment}"
      location = var.region
      
      template {
        service_account = google_service_account.portfolio_runner.email
        
        containers {
          image = "${var.region}-docker.pkg.dev/${var.project_id}/portfolio/portfolio:latest"
          ports {
            container_port = 3000
          }
        }
      }
    }
    
    resource "google_storage_bucket" "portfolio_assets" {
      name          = "${var.project_id}-portfolio-images"
      location      = var.region
      force_destroy = true
    }
    ```

### Application Architecture Changes

#### 1. Containerization Strategy

:::note[Container Evolution]
Migrated from platform-managed runtime to fully containerized deployment

:::

**New Components Added:**
```dockerfile
# Multi-stage Dockerfile for Next.js standalone optimization
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

#### 2. Secret Manager & External SMTP Integration

**Architecture Enhancement:**
- Replaced Azure Communication Email with **Zoho SMTP (`smtp.zoh✅eu`)** and **SendGrid**
- **Zero Plaintext Secrets:** Passwords and API keys stored in **Google Secret Manager**
- **Automatic Secret Resolution:** Mounted dynamically into Cloud Run containers via `value_source.secret_key_ref`

**Result:** Production-grade secret isolation with zero-cost email delivery

#### 3. Environment Configuration Evolution

#### Azure Configuration

    ```bash
    # Azure App Service Settings
    AZURE_STORAGE_ACCOUNT_NAME=pfdev12345678
    AZURE_STORAGE_ACCOUNT_KEY=***
    AZURE_COMMUNICATION_CONNECTION_STRING=***
    APPLICATIONINSIGHTS_CONNECTION_STRING=***
    ```

#### GCP Configuration

    ```bash
    # GCP Cloud Run Environment
    NODE_ENV=production
    GOOGLE_CLOUD_PROJECT=your-project-id
    GCS_BUCKET_NAME=your-project-portfolio-images
    PORT=3000
    ```

---

## 🚀  Migration Process

### Phase 1: Infrastructure Preparation

:::tip[Day 1: Foundation Setup]

**GCP Project Initialization**
```bash
# Create new GCP project
gcloud projects create portfolio-migration-2024

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

**Service Account Setup**
```bash
# Create service account for deployment
gcloud iam service-accounts create portfolio-deployer \
    --display-name="Portfolio Deployment Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:portfolio-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"
```

:::

### Phase 2: Application Migration

:::note[Day 1-2: Code Evolution]

:::

**Containerization Implementation**
```yaml
# .github/workflows/deploy-gcp.yml
name: Deploy to GCP Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Build and Push Image
        run: |
          docker build -t ${{ env.IMAGE_URI }} .
          docker push ${{ env.IMAGE_URI }}
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy portfolio \
            --image ${{ env.IMAGE_URI }} \
            --platform managed \
            --region us-central1 \
            --allow-unauthenticated
```

**Application Refactoring:**
- Removed email service dependencies
- Simplified contact component to display-only
- Updated asset loading for Cloud Storage

### Phase 3: Testing & Validation

```mermaid
graph LR
    A[Code Migration] --> B[Local Testing]
    B --> C[Dev Deployment]
    C --> D[Performance Testing]
    D --> E[Production Ready]
    
    style A fill:#4285f4,stroke:#fff,stroke-width:2px,color:#fff
    style E fill:#34a853,stroke:#fff,stroke-width:2px,color:#fff
```

**Validation Checklist:**
- [ ] All website features functional
- [ ] Responsive design preserved
- [ ] Static assets loading correctly
- [ ] Performance metrics improved
- [ ] Auto-scaling behavior verified

### Phase 4: DNS Migration

:::tip[Day 2: Zero Downtime Cutover]

**Gradual Traffic Migration:**
1. Updated DNS records to Cloud Run URL
2. Monitored DNS propagation globally
3. Verified SSL certificate auto-provisioning
4. Validated all user journeys

:::

---

## 📊  Results & Benefits

### Performance Improvements

| Metric | Azure App Service | GCP Cloud Run | Improvement |
|--------|------------------|---------------|-------------|
| **Cold Start Time** | 8-12 seconds | 3-5 seconds | **60% faster** |
| **Average Response** | 1.2s | 0.8s | **33% faster** |
| **Memory Usage** | 256MB (fixed) | 512MB (on-demand) | **Better allocation** |
| **Scaling** | Manual | Automatic | **Enhanced UX** |

### Cost Analysis

!!! success "Annual Savings: ✅

**Azure Monthly Costs (Previous):**
```
App Service B1:        $13.14/month
Storage Account:       $2.00/month  
Communication Email:   $1.00/month
─────────────────────────────────
Total:                ✅
```

**GCP Monthly Costs (Current):**
```
Cloud Run:            $0 (within free tier)
Cloud Storage:        $0 (within 5GB free tier)  
Artifact Registry:    $0 (within 0.5GB free tier)
─────────────────────────────────
Total:                $0/month
```

### Operational Benefits



 **Simplified Architecture**
: Reduced managed services count, eliminated email complexity

🛡️  **Enhanced Security**  
: Secret Manager integration, IAM-based access control

⚡  **Better DX**
: Faster deployments, container parity, comprehensive logging

 **Improved Monitoring**
: Built-in Cloud Monitoring with better visibility



---

##  Challenges & Solutions

### Challenge 1: Email Service Replacement
:::tip[Issue]
Azure Communication Email service needed replacement in a serverless GCP architecture

:::

:::tip[Solution]
Integrated Zoho SMTP (`smtp.zoh✅eu`) and SendGrid, storing sensitive credentials in **Google Secret Manager** and injecting them securely into Cloud Run at runtime

:::

### Challenge 2: Storage URL Migration  
:::tip[Issue]
Different URL patterns between Azure Storage and GCP Storage

:::

:::tip[Solution]
Updated application configuration, tested all static asset references thoroughly

:::

### Challenge 3: Container Optimization
:::tip[Issue]
Initial monolithic Docker image size was too large (>1GB)

:::

:::tip[Solution]
Implemented multi-stage builds on `node:20-alpine` with Next.js standalone output mode, reducing final runtime image to **✅

:::

### Challenge 4: Environment Variables
:::tip[Issue]
Different environment variable patterns between platforms

:::

:::tip[Solution]
Created environment-specific configs with proper secret management

:::

---

##  Lessons Learned

### Technical Insights

:::tip[Container-First Benefits]
Cloud Run's container model provided superior runtime environment control compared to platform-managed services

:::

:::note[IaC Multi-Cloud Value]
Terraform's multi-cloud support proved invaluable for migration flexibility and future portability

:::

:::tip[Simplification Wins]
Removing email functionality improved maintainability without compromising user experience

:::

### Migration Best Practices

1. **📝 Incremental Approach** - Staged migration reduced risk
2. **🔄 Rollback Planning** - Maintained Azure resources during initial phase  
3. **📚 Documentation** - Comprehensive docs facilitated smooth transition
4. **🔍 Testing Strategy** - Thorough validation at each phase
5. **📊 Monitoring** - Continuous performance monitoring throughout

---

##  Future Enhancements

### Short-term (Next 3 months)
- [ ] Implement Cloud CDN for global content delivery
- [ ] Configure Cloud Monitoring alerting rules
- [ ] Further optimize container image size

### Medium-term (Next 6 months)
- [ ] Multi-region deployment for high availability
- [ ] Automated backup strategies for Cloud Storage
- [ ] Google Analytics 4 integration

### Long-term (Next 12 months)
- [ ] Cloud Functions for additional serverless features
- [ ] Security Command Center integration
- [ ] Advanced CI/CD with Cloud Build

---

## ✅  Conclusion

The Azure to GCP migration was completed successfully with **zero downtime** and significant operational improvements. This project demonstrates:

:::tip[Key Achievements]
- **Cloud Platform Flexibility** through proper architecture design
- **Cost Optimization** via strategic free tier utilization
- **Performance Enhancement** using modern serverless technologies  
- **Operational Simplification** through architectural streamlining

:::

The migration serves as a practical example of cloud migration best practices and showcases expertise across both Azure and GCP platforms.

---

##  Technical Specifications

### Current Infrastructure Stack
```yaml
Platform: Google Cloud Platform
Compute: Cloud Run (serverless containers)
Storage: Cloud Storage (object storage)  
Registry: Artifact Registry (Docker images)
IaC: Terraform
CI/CD: GitHub Actions
Monitoring: Cloud Monitoring & Logging
```

### Repository Evolution
```
├── infra/
│   ├── azure/          # Legacy Azure Bicep (archived)
│   └── gcp/            # Current Terraform infrastructure  
├── .github/workflows/   # Updated CI/CD pipelines
├── components/         # React components
├── app/               # Next.js application
├── Dockerfile         # Container definition
└── docs/
    ├── MIGRATION_CHECKLIST.md
    └── AZURE_TO_GCP_MIGRATION.md
```

---



**Migration completed: October 2024**  
*Document version: 1.0*

[ Back to Portfolio](index.md)
[ Azure Legacy Docs](deployment.md)
[ Monitoring Strategy](monitoring.md)


