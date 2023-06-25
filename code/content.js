const HOMEPAGE = "/webapps/portal/execute/tabs/tabAction";
const USER_INFO_URL = "https://learn.uq.edu.au/learn/api/v1/users/me?expand=systemRoles,insRoles";

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
            isAvailable: course.isAvailable,
            code: course.displayName.substring(1, 9),
            id: course.id
        })
    }
    if (currentSemester.length > 0)
        semesters.push(currentSemester);

    return semesters
}

const storeCurrentCourses = (semesters) => {
    if (semesters.length < 1) return;

    const date = new Date();
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    if (formattedDate === localStorage.getItem("updated_at") && localStorage.getItem("courses") !== null) return;

    const filteredCourses = [];

    for (const course of semesters[0]) {
        filteredCourses.push({
            id: course.id,
            code: course.code
        })
    }

    localStorage.setItem("updated_at", formattedDate);
    localStorage.setItem("courses", JSON.stringify(filteredCourses));
}

/**
 * Injects the Navigation Bar into every page
 */
const injectNavigationBar = () => {
    const existingElement = document.getElementById('injected-navigation-bar');
    if (existingElement !== null) {
        existingElement.remove();
    }

    const navigationElement = document.createElement('div');

    const currentCourses = JSON.parse(localStorage.getItem("courses"));
    if (currentCourses === null) return;
    const courseLinks = createCourseLinks(currentCourses);

    const onHomepage = location.pathname === HOMEPAGE;
    
    const navigationBar = 
    `<div id="breadcrumbs" role="navigation" aria-label="Breadcrumb Navigation" class="breadcrumbs clearfix injected-background">
        <div class="path noToggle injected-separator">
            <ol>
                <li class="root">
                    <a href="${HOMEPAGE}?tab_tab_group_id=_1_1" title="Homepage">
                        <span id="crumb_1">
                            <span class="courseName injected-link">
                                <img class="injected-logo" src="https://insidesherpa.s3.amazonaws.com/tnwj73xKErwjmhndy/UQ-post-white.png" />
                            </span>
                        </span>
                    </a>          
                </li>
            </ol>
            <div class="injected-header-options">
                <ol class="injected-page-options">
                    <li class="${onHomepage ? "root" : "placeholder"} injected-header-option ${onHomepage ? "injected-option-active" : ""}">
                        <a class="injected-remove-margin" href="${HOMEPAGE}?tab_tab_group_id=_1_1" title="Homepage">
                            <span class="courseName injected-link ${onHomepage ? "" : "injected-option-inactive"}">
                                Welcome
                            </span>
                        </a>          
                    </li>
                    ${courseLinks}
                </ol>
                <ol class="injected-levelled injected-header-option">
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
        </div>
    </div>`;
    
    navigationElement.id = 'injected-navigation-bar';
    navigationElement.innerHTML = navigationBar;
    const body = document.body;
    body.insertBefore(navigationElement, body.firstChild);
}

/**
 * Creates the options of the Navigation Bar for all the courses in the Current semester
 * 
 * @returns an HTML String for a list of all Courses in the Current Semester
 */
const createCourseLinks = (courses) => {
    let element = '';
    const searchParams = location.search;

    for (const course of courses) {
        const isActive = searchParams.search(course.id) !== -1;
        element += 
        `<li class="${isActive ? "root" : "placeholder"} injected-header-option ${isActive ? "injected-option-active" : ""}">
            <a class="injected-remove-margin" href="/webapps/blackboard/execute/courseMain?course_id=${course.id}" title="${course.code}">
                <span class="courseName injected-link ${isActive ? "" : "injected-option-inactive"}">
                    ${course.code}
                </span>
            </a>          
        </li>
        `;
    }

    return element;
}

/**
 * Injects the Course List into the Homepage
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

    <div class="injected-course-list-container" style="overflow: auto; aria-expanded=" true"="" id="Tools_Tools">
            ${semesterElement}
    </div>`
    
    courseListElement.className = 'portlet clearfix reorderableModule';
    courseListElement.id = "module_1_48:2"
    courseListElement.innerHTML = courseList;
    parentElement.insertBefore(courseListElement, parentElement.firstChild);
}

/**
 * Creates the HTML String to be inserted the Course List tab of the Homepage
 * 
 * @returns an HTML String for the entire Course List including all semesters
 */
const createSemesterElement = (semesters) => {
    let element = '';

    for (const semester of semesters) {
        const semesterHeader = semester[0].name.substring(semester[0].name.search("Semester"));
        const courseElement = createCourseElements(semester);
        element += 
        `
        <div>
            <h2 class="collapsible injected-list-header">${semesterHeader}</h2>
            <ul class="">
                ${courseElement}
            </ul>
        </div>
        `
    }
    return element;
}

/**
 * Creates an HTML String to be inserted for a group of courses to be inserted into the Course List tab of the Homepage.
 *  
 * @returns an HTML String for a list of Courses within a group (Grouped by Semester).
 */
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

/**
 * Asynchronous call to obtain user information, this provides the Account ID to fetch courses.
 */
const updateUserId = () => {
    fetch(USER_INFO_URL)
        .then(response => response.json())
            .then(data => {
                localStorage.setItem("user_id", data.id);
                console.log(data);
                fetchCourseData()
            })
            .catch(error => {
                console.error('Error:', error);
    });
}

/**
 * Fetches Course data for an Account to populate the Course List and Navigation bar.
 */
const fetchCourseData = () => {
    if (window.location.pathname === HOMEPAGE || localStorage.getItem("courses") === null) {
        fetch(`https://learn.uq.edu.au/learn/api/v1/users/${localStorage.getItem("user_id")}/memberships?expand=course.effectiveAvailability,course.permissions,courseRole&includeCount=true&limit=10000`)
        .then(response => response.json())
            .then(data => {
                const semesters = parseCourseData(data.results);
                storeCurrentCourses(semesters);
                injectCourseList(semesters);
                injectNavigationBar();
        })
            .catch(error => {   
                console.error('Error:', error);
        })
    }
}

injectNavigationBar();
if (localStorage.getItem("user_id") === null) {
    updateUserId();
} else {
    fetchCourseData();
}
