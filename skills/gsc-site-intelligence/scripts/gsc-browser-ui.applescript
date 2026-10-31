-- Read-only: inspect an ALREADY OPEN Chrome GSC Domain Property tab.
-- This program never activates/launches Chrome, opens tabs, clicks, navigates,
-- modifies a Google setting, or reads cookies, storage, passwords or tokens.
-- Run only on an Owner-authorized macOS device through the approved DC link.
on run argv
 if (count of argv) is not 1 then return "BLOCKED_EXPECTED_ONE_DOMAIN_ARGUMENT"
 set domainName to item 1 of argv as text
 if (length of domainName) > 253 or domainName does not contain "." or domainName begins with "." or domainName ends with "." or domainName contains ".." then return "BLOCKED_INVALID_DOMAIN"
 set allowedChars to "abcdefghijklmnopqrstuvwxyz0123456789-."
 repeat with theChar in characters of domainName
  if allowedChars does not contain (theChar as text) then return "BLOCKED_INVALID_DOMAIN"
 end repeat
 if application "Google Chrome" is not running then return "BLOCKED_CHROME_NOT_RUNNING"
 tell application "Google Chrome"
  repeat with w in windows
   repeat with t in tabs of w
    try
     set pageUrl to URL of t
     if pageUrl begins with "https://search.google.com/search-console" and pageUrl contains "resource_id=sc-domain%3A" then
      set js to "(function(){const u=new URL(location.href);const want='sc-domain:" & domainName & "';if(u.searchParams.get('resource_id')!==want)return 'SKIP_OTHER_PROPERTY';if(!document.body)return 'BLOCKED_PAGE_NOT_LOADED';const text=document.body.innerText||'';if(text.length<100)return 'BLOCKED_EMPTY_REPORT';return JSON.stringify({source:'GSC_EXISTING_CHROME_UI_READONLY',property:want,title:document.title,url:u.href,observed_at:new Date().toISOString(),ui_text:text.slice(0,16000)});})()"
      set resultText to execute t javascript js
      if resultText is not "SKIP_OTHER_PROPERTY" then return resultText
     end if
    on error errMsg
     return "BLOCKED_BROWSER_SCRIPT_ERROR: " & errMsg
    end try
   end repeat
  end repeat
 end tell
 return "BLOCKED_NO_MATCHING_EXISTING_GSC_DOMAIN_TAB"
end run
