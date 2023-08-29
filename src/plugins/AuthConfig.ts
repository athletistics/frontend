import {OidcClientSettings} from "oidc-client-ts";

const authConfig: OidcClientSettings = {
    authority: import.meta.env.VITE_ZITADEL_URL + '',
    client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID + '',
    redirect_uri: import.meta.env.VITE_APP_URL + 'callback',
    response_type: 'code',
    scope: 'openid profile email urn:zitadel:iam:org:project:id:zitadel:aud',
    post_logout_redirect_uri: import.meta.env.VITE_APP_URL + '',
    response_mode: 'query',
};

export default authConfig;