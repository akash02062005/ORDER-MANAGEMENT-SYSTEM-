// This component has been deprecated.
// OAuth2 login now uses real Google & GitHub OAuth2 redirects via Spring Security.
// See OAUTH_SETUP_GUIDE.md for setup instructions.
//
// The Login.jsx and Register.jsx pages now call `redirectToOAuth(provider)`
// which redirects to the Spring Boot OAuth2 authorization endpoint:
//   http://localhost:8080/oauth2/authorization/google
//   http://localhost:8080/oauth2/authorization/github

export default () => null;
