*** Settings ***
Library           RequestsLibrary
Library           Collections

*** Variables ***
${BASE_URL}       https://travel-booking-all-in-one-production.up.railway.app

*** Test Cases ***
Verify Get Tour Packages API
    [Documentation]    Test that the backend packages endpoint returns a 200 OK status.
    Create Session    backend    ${BASE_URL}    verify=True
    ${response}=      GET On Session    backend    /api/users/packages/    expected_status=any
    Log To Console    \nResponse Status: ${response.status_code}
    Log To Console    \nResponse Body: ${response.content}
    
    # Assertions
    Should Be Equal As Integers    ${response.status_code}    200
    ${json}=          Set Variable    ${response.json()}
    Should Not Be Empty    ${json}
