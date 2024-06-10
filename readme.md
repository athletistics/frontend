# ⚡Athletistics - Frontend

> Bachelor thesis
>
> Nicolas Fabrice Baeriswyl
>
> HEIA-FR, 2023

## 🚩 Introduction

This repository contains the Athletistics frontend. More details can be found in the main repository's technical report.

## Setup

To start this API, you first need to create a .env file pointing towards an Infisical instance with the following
environment variables.

```dotenv
VITE_CORE_API_URL=[core api url /api/v1]
VITE_ZITADEL_URL=[exact Zitadel URI]
VITE_ZITADEL_CLIENT_ID=[project ID]
VITE_APP_URL=[exact frontend base URI]
VITE_TOTP_API_URL=[totp api url /api/v1/totp]
VITE_STRAVA_API_URL=[strava api url /api/v1/strava]
VITE_STRAVA_REDIRECT_BASE=[base URI of the redirection after login/logout]
VITE_STRAVA_CLIENT_ID=[strava client ID]
```

Locally, the following `.env` file is to be created.

```.env
INFISICAL_TOKEN=
INFISICAL_API_URL=https://your-infisical-instance.ch/api
ENV=dev
```

For the next step, Infisical must be installed. Initialize the project for Infisical, and connect to the instance.

```shell
infisical init
infisical login
```

Then, start the dev server.

```shell
infisical run --path="/frontend" -- npm run dev
```

## License

```
Athletistics
Copyright (C) 2023 Nicolas Fabrice Baeriswyl

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
```