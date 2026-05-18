*** Settings ***
Library           SeleniumLibrary

*** Variables ***
${URL}            https://accomplished-freedom-production.up.railway.app/
${BROWSER}        chrome

*** Test Cases ***
Verify Travel Website Landing Page
    [Documentation]    Test that the live homepage loads properly and displays critical sections.
    # Open Chrome browser
    Open Browser    ${URL}    ${BROWSER}    options=add_argument("--disable-gpu"); add_argument("--no-sandbox")
    Maximize Browser Window
    
    # Wait for the main page header to appear
    Wait Until Page Contains    Let's make your dream trip come true    timeout=10s
    
    # Verify page title
    Title Should Be    Booking & Travel
    
    # Verify key sections exist
    Page Should Contain    Today Recommended for you Tour Packages
    Page Should Contain    Keep in Touch
    
    # Verify navigation links are present
    Page Should Contain Link    /packagesList
    Page Should Contain Link    /blog
    Page Should Contain Link    /about
    
    [Teardown]    Close Browser
