const parseCourseData = (results) => {

    const semesters = []
    const semesterSet = new Set()

    let currentSemester = [];

    for (const result of results) {
        const course = result.course;
        if (course.displayName[0] !== '[' || course.displayName.search("Exam") !== -1) continue;

        if (!semesterSet.has(course.termId)) {
            if (currentSemester.length > 0) {
                semesters.push(currentSemester);
                currentSemester = [];
            }
            semesterSet.add(course.termId);
        }

        currentSemester.push({
            url: course.homePageUrl,
            name: course.displayName,
            isAvailable: course.isAvailable
        })
    }
    if (currentSemester.length > 0)
        semesters.push(currentSemester);

    return semesters
}

/**
 * Navigation Header containing Course Search and Useful Links
 */
const injectNavigationBar = () => {
    const navigationElement = document.createElement('div');

//     <li class="placeholder">
//     <a href="/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1" title="Homepage">
//         <span id="crumb_2">
//             <span class="courseName injected-link">
//                 CSSE2310
//             </span>
//         </span>
//     </a>          
// </li>
// <li class="placeholder">
//     <a href="/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1" title="Homepage">
//         <span id="crumb_2">
//             <span class="courseName injected-link">
//                 COMP3506
//             </span>
//         </span>
//     </a>          
// </li>
// <li class="placeholder">
//     <a href="/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1" title="Homepage">
//         <span id="crumb_2">
//             <span class="courseName injected-link">
//                 COMP4500
//             </span>
//         </span>
//     </a>          
// </li>
    
    const navigationBar = 
    `<div id="breadcrumbs" role="navigation" aria-label="Breadcrumb Navigation" class="breadcrumbs clearfix injected-background">
        <div class="path noToggle injected-separator">
            <ol>
                <li class="root">
                    <a href="/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1" title="Homepage">
                        <span id="crumb_1">
                            <span class="courseName injected-link">
                                Back to Homepage
                            </span>
                        </span>
                    </a>          
                </li>
            </ol>
            <ol>
                <li class="root">
                    <span id="crumb_1">
                        <span class="courseName injected-link">
                            Course Search
                        </span>
                    </span>
                </li>
                <li class="placeholder">
                    <form action="/webapps/blackboard/execute/viewCatalog" onsubmit="return markNewSearch(this);" method="post">
                        <input type="hidden" name="type" id="type" value="Course">
                        <input type="hidden" name="command" id="command" value="NewSearch">
                        <p class="hideoff"><label for="orgSearchText">Search</label></p>
                        <input type="text" name="searchText" id="orgSearchText" value="" size="15">
                        <script type="text/javascript">
                            formCheckList.addElement( new inputText( { invalid_chars:/[<>\'\"]/g,
                                                                    ref_label:"Search",
                                                                    name:"searchText" } ) );
                        </script>
                        <input class="button-4" type="submit" value="Go">
                    </form>    
                </li>
            </ol>
        </div>
    </div>`;
    
    navigationElement.id = 'injected-navigation-bar';
    navigationElement.innerHTML = navigationBar;
    const body = document.body;
    body.insertBefore(navigationElement, body.firstChild);
}

/**
 * Course List 
 */
const injectCourseList = (semesters) => {
    const parentElement = document.getElementById('column1');
    if (parentElement === null) return;

    const courseListElement = document.createElement('div');

    const semesterElement = createSemesterElement(semesters);
    
    const courseList = 
    `<!-- extid:portal/tools/my_institution: --> 
    <div class="edit_controls">
        <a href="#" class="moduleToggleLink" role="button" aria-expanded="true" aria-controls="Tools_Tools"><img alt="Tools Module" src="https://learn.content.blackboardcdn.com/3900.67.0-rel.38+6532b86/images/ci/ng/portlet_contract.gif"></a>
    </div>
  
    <h2 class="dragHandle  clearfix" id="anonymous_element_5" style="cursor: default;">
        <span class="moduleTitle">Course List</span>
        <span class="reorder"><span><img src="https://learn.content.blackboardcdn.com/3900.67.0-rel.38+6532b86/images/ci/icons/generic_move.gif" alt=""></span></span>
    </h2>

    <div style="overflow: auto; aria-expanded=" true"="" id="Tools_Tools">
            ${semesterElement}

    </div>`
    
    courseListElement.className = 'portlet clearfix reorderableModule';
    courseListElement.id = 'module:_48_2';
    courseListElement.innerHTML = courseList;
    parentElement.insertBefore(courseListElement, parentElement.firstChild);
}

const createSemesterElement = (semesters) => {
    let element = '';

    for (const semester of semesters) {
        const semesterHeader = semester[0].name.substring(semester[0].name.search("Semester"));
        const courseElement = createCourseElements(semester);
        element += 
        `
        <div>
            <h2 class="collapsible">${semesterHeader}</h2>
            <ul class="">
                ${courseElement}
            </ul>
        </div>
        `
    }
    return element;
}

const createCourseElements = (courseList) => {
    let element = '';

    for (const course of courseList) {
        element +=
        `
        <li class="collapsible">
            <a class="${course.isAvailable ? "" : "injected-red"}" href="${course.url}" target="_self">${course.name.length < 92 ? course.name : course.name.substring(0, 90) + "..."}</a>
        </li>
        `
    }

    return element;
}

injectNavigationBar();

fetch('https://learn.uq.edu.au/learn/api/v1/users/me?expand=systemRoles,insRoles')
    .then(response => response.json())
    .then(data => {
        const id = data.id;
        fetch(`https://learn.uq.edu.au/learn/api/v1/users/${id}/memberships?expand=course.effectiveAvailability,course.permissions,courseRole&includeCount=true&limit=10000`)
            .then(response => response.json())
            .then(data => {
                const courses = parseCourseData(data.results)
                injectCourseList(courses);
        })
            .catch(error => {
                console.error('Error:', error);
        });
})
    .catch(error => {
        console.error('Error:', error);
});
    