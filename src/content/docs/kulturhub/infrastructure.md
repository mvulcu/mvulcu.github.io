---
title: Infrastructure as Code
description: Azure Bicep templates and deployment strategies for KulturHub
icon: material/terraform
---

## Overview

KulturHub's infrastructure is fully defined as code using Azure Bicep, enabling reproducible deployments, version control, and automated provisioning. This approach ensures consistency across environments and simplifies disaster recovery.

## Bicep Module Architecture

### Directory Structure

```
infra/
├── main.bicep                    # Main orchestration file
├── modules/                      # Reusable components
│   ├── jumpbox-subnet.bicep     # Admin access subnet
│   └── jumpbox.bicep            # Jumpbox VM for secure access
├── alert-requestFailures.bicep   # Alert configurations
├── appService.bicep             # App Service configuration
├── cosmos.bicep                 # Cosmos DB setup (historical)
├── insights.bicep               # Application Insights
├── nsg.bicep                    # Network Security Groups
├── plan.bicep                   # App Service Plan
├── storage.bicep                # Blob Storage
└── vnet.bicep                   # Virtual Network
```

## Core Infrastructure Components

### Main Orchestration (main.bicep)

The main Bicep file orchestrates all modules and defines parameter flow:

```bicep
// main.bicep
@description('The environment name')
@allowed(['dev', 'prod'])
param environment string = 'prod'

@description('The Azure region')
param location string = resourceGroup().location

// App Service Plan
module appServicePlan 'plan.bicep' = {
  name: 'kulturhub-plan-${environment}'
  params: {
    planName: 'kulturhub-plan-${environment}'
    location: location
    sku: environment == 'prod' ? 'P1V2' : 'B1'
  }
}

// App Service
module appService 'appService.bicep' = {
  name: 'kulturhub-app-${environment}'
  params: {
    appName: 'kulturhub-app-${environment}'
    planId: appServicePlan.outputs.planId
    location: location
  }
}
```

### App Service Configuration

The App Service module configures the containerized application:

```bicep
// appService.bicep
param appName string
param planId string
param location string
@description('Docker image tag for immutable and reproducible deployments')
param imageTag string = 'latest'

resource appService 'Microsoft.Web/sites@2022-03-01' = {
  name: appName
  location: location
  properties: {
    serverFarmId: planId
    siteConfig: {
      linuxFxVersion: 'DOCKER|ghcr.io/mvulcu/kulturhub:${imageTag}'
      alwaysOn: true
      http20Enabled: true
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://ghcr.io'
        }
      ]
    }
  }
}

output appServiceId string = appService.id
output defaultHostName string = appService.properties.defaultHostName
```

### Network Infrastructure

Virtual Network setup with security isolation:

```bicep
// vnet.bicep
param vnetName string = 'kulturhub-vnet'
param location string

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2022-07-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: ['10.0.0.0/16']
    }
    subnets: [
      {
        name: 'appsvc-subnet'
        properties: {
          addressPrefix: '10.0.1.0/24'
          delegations: [
            {
              name: 'delegation'
              properties: {
                serviceName: 'Microsoft.Web/serverFarms'
              }
            }
          ]
        }
      }
      {
        name: 'private-endpoint-subnet'
        properties: {
          addressPrefix: '10.0.2.0/24'
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
    ]
  }
}
```

### Storage Configuration

Blob storage for user-uploaded images:

```bicep
// storage.bicep
param storageAccountName string
param location string

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2022-09-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          allowedOrigins: [
            'https://kulturhub-app-prod.azurewebsites.net'
            'http://localhost:3000'
          ]
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
          exposedHeaders: ['*']
          maxAgeInSeconds: 3600
        }
      ]
    }
  }
}

// Security: Public read allowed for event banners, but mutations require server-side SAS tokens
```

## Resource Deployment

### Deployment Commands

#### Development Environment

```bash
# Create resource group
az group create \
  --name kulturhub-rg-dev \
  --location northeurope

# Deploy infrastructure
az deployment group create \
  --resource-group kulturhub-rg-dev \
  --template-file ./infra/main.bicep \
  --parameters environment=dev
```

#### Production Environment

```bash
# Create resource group
az group create \
  --name kulturhub-rg-prod \
  --location northeurope

# Deploy infrastructure
az deployment group create \
  --resource-group kulturhub-rg-prod \
  --template-file ./infra/main.bicep \
  --parameters environment=prod
```

### Validation and Testing

Before deploying to production, always validate:

```bash
# Validate template
az deployment group validate \
  --resource-group kulturhub-rg-prod \
  --template-file ./infra/main.bicep

# What-if analysis
az deployment group what-if \
  --resource-group kulturhub-rg-prod \
  --template-file ./infra/main.bicep
```

## Resource Protection

### Resource Locks

Critical resources are protected from accidental deletion:

```bash
# Lock App Service
az lock create \
  --name LockAppService \
  --lock-type CanNotDelete \
  --resource-group kulturhub-rg-prod \
  --resource-name kulturhub-app-prod \
  --resource-type Microsoft.Web/sites

# Lock Storage Account
az lock create \
  --name LockStorage \
  --lock-type CanNotDelete \
  --resource-group kulturhub-rg-prod \
  --resource-name kulturhubstorage \
  --resource-type Microsoft.Storage/storageAccounts
```

## Infrastructure Evolution

### Original Architecture (Full Azure)

The initial implementation included:

- **Cosmos DB** with private endpoints
- **Application Insights** with full telemetry
- **Network isolation** via VNet integration
- **Multiple subnets** for service separation
- **NSG rules** for traffic control

### Optimized Architecture (Current)

Post-optimization focuses on essentials:

- **App Service** for container hosting
- **Blob Storage** for images
- **Basic networking** for security
- **External services** (MongoDB Atlas)
- **Simplified monitoring**

## Best Practices Applied

### 1. Modularity

Each resource type has its own module:<br>
- Easier maintenance<br>
- Reusable components<br>
- Clear dependencies<br>
- Isolated testing

### 2. Parameterization

Environment-specific values are parameterized:<br>
- Resource naming conventions<br>
- SKU sizes<br>
- Feature flags<br>
- Connection strings

### 3. Output Management

Modules export necessary values:<br>
- Resource IDs for dependencies<br>
- Connection strings<br>
- URLs and endpoints<br>
- Configuration values

### 4. Security by Default

All resources implement security best practices:<br>
- HTTPS enforcement<br>
- Minimum TLS 1.2<br>
- Managed identities where possible<br>
- Network restrictions

##  Azure Student Subscription Constraints & Trade-offs

Building within an **Azure for Students** subscription ($100 credit limit, restricted tenant roles) requires deliberate engineering trade-offs:

| Constraint / Restriction | Impact on Architecture | Mitigating Architectural Decision |
|--------------------------|------------------------|-----------------------------------|
| **No Entra ID SPN Creation** | Cannot provision Service Principals for OIDC federation | Automated deployments authenticate via encrypted GitHub Secrets with Azure Publish Profiles with least-privilege repository access |
| **No Key Vault RBAC / Policy** | Cannot bind Key Vault directly to App Service | Secrets stored encrypted at rest in App Service Configuration (AES-256) and GitHub Secrets |
| **B1 SKU (No Deployment Slots)** | Cannot perform blue/green slot staging swaps | Atomic container updates using immutable Git SHA image tags with automated rollback capability |
| **$100 Annual Credit Ceiling** | Enterprise services (Front Door, Cosmos DB) exhaust quota rapidly | Architecture optimized to B1 App Service + MongoDB Atlas M0 + Open Source Grafana VM (✅ |

## Troubleshooting

### Common Issues

1. **Deployment Failures**
   - Check resource name availability
   - Verify subscription limits
   - Review dependency order

2. **Network Connectivity**
   - Validate subnet configurations
   - Check NSG rules
   - Verify service endpoints

3. **Access Issues**
   - Confirm RBAC assignments
   - Check firewall rules
   - Validate authentication

### Rollback Strategy

In case of deployment issues:

```bash
# List deployment history
az deployment group list \
  --resource-group kulturhub-rg-prod

# Rollback to previous deployment
az deployment group create \
  --resource-group kulturhub-rg-prod \
  --template-file ./infra/main.bicep \
  --parameters @previous-parameters.json
```

---



[ Architecture](architecture.md)
[ CI/CD Pipeline](cicd.md)


