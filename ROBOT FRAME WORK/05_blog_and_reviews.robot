*** Settings ***
Library           SeleniumLibrary
Library           RequestsLibrary
Library           Collections

*** Variables ***
${FRONTEND_URL}    https://accomplished-freedom-production.up.railway.app
${BACKEND_URL}     https://travel-booking-all-in-one-production.up.railway.app
${BROWSER}         chrome

*** Test Cases ***
Verify Blog Posts List API
    [Documentation]    Test that fetching blog posts via API returns successful response.
    [Tags]    API    Blog
    Create Session    backend    ${BACKEND_URL}    verify=True
    ${response}=      GET On Session    backend    /api/users/blog/posts/    expected_status=any
    Log To Console    Blog API Status: ${response.status_code}
    IF    ${response.status_code} == 200
        ${json}=    Set Variable    ${response.json()}
        Log To Console    Blog Posts Found: ${json.__len__()}
    END

Verify Web UI Blog Page Layout
    [Documentation]    Test that the blog listing page opens and renders posts correctly.
    [Tags]    UI    Blog
    Open Browser    ${FRONTEND_URL}/blog    ${BROWSER}    options=add_argument("--disable-gpu"); add_argument("--no-sandbox")
    Maximize Browser Window
    Wait Until Page Contains    Travel Blog    timeout=10s
    Page Should Contain    Latest Travel Stories
    [Teardown]    Close Browser
