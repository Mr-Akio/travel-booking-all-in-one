*** Settings ***
Library           SeleniumLibrary
Library           RequestsLibrary
Library           Collections

*** Variables ***
${FRONTEND_URL}    https://accomplished-freedom-production.up.railway.app
${BACKEND_URL}     https://travel-booking-all-in-one-production.up.railway.app
${BROWSER}         chrome

*** Test Cases ***
Verify Agency Stats API Authentication Requirement
    [Documentation]    Test that agency stats endpoint requires proper authentication.
    [Tags]    API    Agency
    Create Session    backend    ${BACKEND_URL}    verify=True
    ${response}=      GET On Session    backend    /api/users/agency/stats/    expected_status=401
    Log To Console    Unauthenticated Agency Stats Request correctly returned 401.

Verify Agency Dashboard UI Route Redirection
    [Documentation]    Test that visiting the agency route without login redirects to login.
    [Tags]    UI    Agency
    Open Browser    ${FRONTEND_URL}/agency    ${BROWSER}    options=add_argument("--disable-gpu"); add_argument("--no-sandbox")
    Maximize Browser Window
    # Should redirect or display sign in page
    Wait Until Page Contains    Sign In    timeout=10s
    Location Should Contain    /login
    [Teardown]    Close Browser
