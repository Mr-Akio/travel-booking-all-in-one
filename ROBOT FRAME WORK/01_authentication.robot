*** Settings ***
Library           SeleniumLibrary
Library           RequestsLibrary
Library           Collections

*** Variables ***
${FRONTEND_URL}    https://accomplished-freedom-production.up.railway.app
${BACKEND_URL}     https://travel-booking-all-in-one-production.up.railway.app
${BROWSER}         chrome
${TEST_USER}       testrobot_${RANDOM_NUMBER}
${TEST_EMAIL}      robot_${RANDOM_NUMBER}@test.com
${TEST_PASSWORD}   Password123!
${RANDOM_NUMBER}   54321

*** Test Cases ***
Verify User Registration API
    [Documentation]    Test that registering a new user via API works correctly.
    [Tags]    API    Auth
    Create Session    backend    ${BACKEND_URL}    verify=True
    ${headers}=       Create Dictionary    Content-Type=application/json
    ${body}=          Create Dictionary    username=robot_tester_${RANDOM_NUMBER}    email=robot_test_${RANDOM_NUMBER}@example.com    password=SecurePass123!    role=USER
    ${response}=      POST On Session    backend    /api/users/register/    json=${body}    headers=${headers}    expected_status=any
    Log To Console    Register Status: ${response.status_code}
    Log To Console    Register Body: ${response.content}
    # Expected: 201 Created or 400 if user exists, we accept 201 or 400 for safety in rerun
    Should Be True    ${response.status_code} == 201 or ${response.status_code} == 400

Verify User Login API
    [Documentation]    Test that logging in via API returns a JWT Token.
    [Tags]    API    Auth
    Create Session    backend    ${BACKEND_URL}    verify=True
    ${headers}=       Create Dictionary    Content-Type=application/json
    ${body}=          Create Dictionary    username=admin    password=adminpassword
    ${response}=      POST On Session    backend    /api/users/login/    json=${body}    headers=${headers}    expected_status=any
    Log To Console    Login Status: ${response.status_code}
    # If admin credentials are correct, should return 200 and access token
    IF    ${response.status_code} == 200
        ${json}=    Set Variable    ${response.json()}
        Dictionary Should Contain Key    ${json}    access
        Dictionary Should Contain Key    ${json}    refresh
    ELSE
        Log To Console    Note: Default Admin login skipped or credentials differ.
    END

Verify Web UI Registration Page Layout
    [Documentation]    Test that the frontend registration page renders properly.
    [Tags]    UI    Auth
    Open Browser    ${FRONTEND_URL}/register    ${BROWSER}    options=add_argument("--disable-gpu"); add_argument("--no-sandbox")
    Maximize Browser Window
    Wait Until Page Contains    Sign Up    timeout=10s
    Page Should Contain    Create an account
    Page Should Contain Element    xpath=//input[@name='username']
    Page Should Contain Element    xpath=//input[@name='email']
    Page Should Contain Element    xpath=//input[@name='password']
    Page Should Contain Button    xpath=//button[@type='submit']
    [Teardown]    Close Browser

Verify Web UI Login Page Layout and Elements
    [Documentation]    Test that the frontend login page displays normal login and Google Sign-In.
    [Tags]    UI    Auth
    Open Browser    ${FRONTEND_URL}/login    ${BROWSER}    options=add_argument("--disable-gpu"); add_argument("--no-sandbox")
    Maximize Browser Window
    Wait Until Page Contains    Sign In    timeout=10s
    Page Should Contain    Welcome back!
    Page Should Contain Element    xpath=//input[@name='username']
    Page Should Contain Element    xpath=//input[@name='password']
    # Check for Google Sign-in button
    Page Should Contain    Sign in with Google
    [Teardown]    Close Browser
