# TsaoCaa Columbus

Mobile ordering & loyalty app for TsaoCaa (朝茶) bubble tea — Columbus, OH location.

## Project Structure

```
TsaocaaColumbus/
├── template.yaml              # AWS SAM infrastructure template
├── samconfig.toml              # SAM deployment configuration
├── tsaocaa-backend/            # Spring Boot 3.2 + Java 21 backend
│   ├── pom.xml
│   └── src/main/java/com/tsaocaa/columbus/
│       ├── controller/         # REST controllers
│       ├── service/            # Business logic
│       ├── model/entity/       # JPA entities
│       ├── repository/         # Spring Data repositories
│       ├── dto/                # Request/response DTOs
│       ├── exception/          # Custom exceptions + handler
│       └── config/             # Security, CORS, S3/SNS config
├── tsaocaa-mobile/             # React Native + Expo mobile app
│   ├── App.tsx
│   └── src/
│       ├── screens/            # Home, Menu, Game, Store, Profile, Auth
│       ├── navigation/         # Bottom tab + stack navigators
│       ├── api/                # Axios client + React Query hooks
│       ├── store/              # Zustand auth store
│       └── constants/          # Brand colors
└── tsaocaa-admin/              # Vite + React admin panel
    └── src/
        └── App.tsx             # Single-file admin dashboard
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native, Expo ~52, TypeScript |
| Backend | Spring Boot 3.2, Java 21, Maven |
| Database | MySQL 8.0 (Amazon RDS) |
| Auth | Amazon Cognito (JWT) |
| Infra | AWS Lambda (SnapStart), API Gateway, S3, SNS |
| IaC | AWS SAM |
| Admin | Vite + React + TypeScript |

## Prerequisites

- Java 21 (e.g., Amazon Corretto)
- Maven 3.9+
- Node.js 20+
- AWS CLI v2 configured with credentials
- AWS SAM CLI
- Expo CLI (`npm install -g expo-cli`)

## Getting Started

### 1. Deploy AWS Infrastructure

```bash
# Build the backend
cd tsaocaa-backend
mvn clean package -DskipTests

# Deploy everything (first time — guided)
cd ..
sam build
sam deploy --guided
```

After deployment, note the outputs:
- `ApiUrl` — API Gateway endpoint
- `UserPoolId` — Cognito User Pool ID
- `UserPoolClientId` — Cognito App Client ID
- `AssetsBucketName` — S3 bucket for images

### 2. Create Admin User

```bash
# Create a Cognito user for the admin panel
aws cognito-idp admin-create-user \
  --user-pool-id <UserPoolId> \
  --username admin@tsaocaa.com \
  --temporary-password 'TempPass123!' \
  --user-attributes Name=email,Value=admin@tsaocaa.com Name=email_verified,Value=true

# Add to admin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <UserPoolId> \
  --username admin@tsaocaa.com \
  --group-name admin
```

### 3. Run Mobile App (Development)

```bash
cd tsaocaa-mobile
cp .env.example .env.local
# Edit .env.local with your Cognito and API values

npm install
npx expo start
```

### 4. Run Admin Panel (Development)

```bash
cd tsaocaa-admin
cp .env.example .env.local
# Edit .env.local with your Cognito and API values

npm install
npm run dev
# Opens at http://localhost:3001
```

### 5. Local Backend Development

The backend runs locally with an H2 in-memory database (no MySQL needed):

```bash
cd tsaocaa-backend
mvn spring-boot:run
# API at http://localhost:8080
# Auth is disabled in local profile
```

## Mobile App Tabs

| Tab | Description |
|-----|-------------|
| Home | Announcements, featured drinks, quick actions |
| Menu | Browse categories, search, view drink details |
| Game | Spin-the-wheel game, weekly coupon book (3 slots) |
| Store | Hours, map, directions, contact info |
| Profile | Login/signup, view coupons, account settings |

## Game & Coupon System

- **Spin the Wheel**: 3 plays/day, server-side weighted random outcome
- **Coupon Book**: 3 slots/week, reset every Monday midnight ET
- **Coupon Lifecycle**: ACTIVE → REDEEMED (scanned in-store) or REPLACED (new win)
- **QR Codes**: Each coupon has a unique TSA-XXXX code displayed as QR for in-store scanning

## API Endpoints

All endpoints are prefixed with `/api/v1/`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /menu/categories | No | List all menu categories |
| GET | /menu/categories/{id}/items | No | Items in a category |
| GET | /menu/items/{id} | No | Item detail with customizations |
| GET | /store/info | No | Store info with today's hours |
| GET | /store/announcements | No | Active announcements |
| POST | /auth/register | Yes | Register user profile |
| GET | /auth/profile | Yes | Get user profile |
| GET | /game/config | Yes | Game configuration |
| POST | /game/play | Yes | Play the wheel game |
| GET | /coupons | Yes | User's coupons |
| POST | /coupons/{id}/redeem | Yes | Redeem a coupon |
| POST | /coupons/replace | Yes | Replace an existing coupon |
| POST | /admin/** | Admin | Admin operations |

## Building for Production

### Mobile App (EAS Build)

```bash
cd tsaocaa-mobile
# Install EAS CLI
npm install -g eas-cli

# Configure (first time)
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

### Admin Panel

```bash
cd tsaocaa-admin
npm run build
# Deploy dist/ to S3 + CloudFront or any static host
```
