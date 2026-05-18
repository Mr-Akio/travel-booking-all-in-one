*** Settings ***
Library           SeleniumLibrary
Library           RequestsLibrary
Library           Collections

*** Variables ***
${FRONTEND_URL}    https://accomplished-freedom-production.up.railway.app
${BACKEND_URL}     https://travel-booking-all-in-one-production.up.railway.app
${BROWSER}         chrome

*** Test Cases ***
Verify Get All Packages API
    [Documentation]    Test that the backend packages listing API returns correct data format.
    [Tags]    API    Packages
    Create Session    backend    ${BACKEND_URL}    verify=True
    ${response}=      GET On Session    backend    /api/users/packages/    expected_status=200
    ${json}=          Set Variable    ${response.json()}
    Should Not Be Empty    ${json}
    # Validate structure of first package
    ${first_pkg}=     Get From List    ${json}    0
    Dictionary Should Contain Key    ${first_pkg}    id
    Dictionary Should Contain Key    ${first_pkg}    title
    Dictionary Should Contain Key    ${first_pkg}    price
    Dictionary Should Contain Key    ${first_pkg}    location
    Log To Console    Total Packages Found: ${json.__len__()}

Verify Get Single Package Detail API
    [Documentation]    Test that retrieving a single package by ID works correctly.
    [Tags]    API    Packages
    Create Session    backend    ${BACKEND_URL}    verify=True
    # Fetch all first to get a valid ID
    ${list_response}=  GET On Session    backend    /api/users/packages/    expected_status=200
    ${packages}=       Set Variable    ${list_response.json()}
    ${first_pkg}=      Get From List    ${packages}    0
    ${pkg_id}=         Get From Dictionary    ${first_pkg}    id
    
    # Get details
    ${detail_response}=  GET On Session    backend    /api/users/packages/${pkg_id}/    expected_status=200
    ${detail}=         Set Variable    ${detail_response.json()}
    ${detail_id}=      Get From Dictionary    ${detail}    id
    Should Be Equal As Integers    ${detail_id}    ${pkg_id}
    Dictionary Should Contain Key    ${detail}    description
    Dictionary Should Contain Key    ${detail}    duration_detail
    Dictionary Should Contain Key    ${detail}    activities

Verify Web UI Packages List Page
    [Documentation]    Test that the packages listing page displays package cards.
    [Tags]    UI    Packages
    Open Browser    ${FRONTEND_URL}/packagesList    ${BROWSER}    options=add_argument("--disable-gpu"); add_argument("--no-sandbox")
    Maximize Browser Window
    Wait Until Page Contains    Recommended for you    timeout=10s
    Page Should Contain    Japan Tour Packages
    # Check that at least one package card is displayed
    Page Should Contain Element    xpath=//a[contains(@href, '/packages/')]
    [Teardown]    Close Browser
