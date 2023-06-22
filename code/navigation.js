var div = document.createElement('div');

div.id = 'home-page';
div.innerHTML = 
`<div id="breadcrumbs" role="navigation" aria-label="Breadcrumb Navigation" class="breadcrumbs clearfix injected-background">
    <div class="path  noToggle">
        <ol class="clearfix">
            <li class="root">
                <a href="/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1" title="Homepage">
                    <span id="crumb_1">
                        <span class="courseName injected-link">
                            Home
                        </span>
                    </span>
                </a>          
            </li>
            <li class="placeholder">
                <a href="/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1" title="Homepage">
                    <span id="crumb_2">
                        <span class="courseName injected-link">
                            CSSE2310
                        </span>
                    </span>
                </a>          
            </li>
            <li class="placeholder">
                <a href="/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1" title="Homepage">
                    <span id="crumb_2">
                        <span class="courseName injected-link">
                            COMP3506
                        </span>
                    </span>
                </a>          
            </li>
            <li class="placeholder">
                <a href="/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1" title="Homepage">
                    <span id="crumb_2">
                        <span class="courseName injected-link">
                            COMP4500
                        </span>
                    </span>
                </a>          
            </li>
        </ol>
    </div>
</div>`;

var body = document.body;

// Append the div to the body of the page
body.insertBefore(div, body.firstChild);

fetch('https://learn.uq.edu.au/learn/api/v1/users/_456684_1/memberships?expand=course.effectiveAvailability,course.permissions,courseRole&includeCount=true&limit=10000')
  .then(response => response.json())
  .then(data => {
    // Process the response data
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });