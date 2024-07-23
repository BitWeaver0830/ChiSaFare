$(document).ready(function () {
    
    fillHeader();

});

function fillHeader(){
    var headerTemplate = `
    <div class="container-fluid d-flex flex-column p-0"><a
    class="navbar-brand d-flex justify-content-center align-items-center sidebar-brand m-0" href="#">
    <div class="mt-2 mb-3"><img class="img-fluid" src="assets/img/Logo-CSF.png"></div>
</a>
<hr class="sidebar-divider my-0">
<ul class="navbar-nav text-light" id="accordionSidebar">
    <li id="list-dashboard" class="nav-item"><a class="nav-link" href="owner-dashboard.html"><i
                class="fas fa-tachometer-alt"></i><span>Dashboard</span></a></li>
    <li class="nav-item"><a class="nav-link" href="profile.html"><i
                class="fas fa-user"></i><span>Profilo</span></a></li>
    <li class="nav-item"><a class="nav-link" href="table.html"><i
                class="fas fa-table"></i><span>Database</span></a></li>

</ul>

`;

$("#header").html(headerTemplate);

    var topPageTemplate = `
    <div class="container-fluid">
    <ul class="navbar-nav flex-nowrap ms-auto">
        <div class="d-none d-sm-block topbar-divider"></div>
        <li class="nav-item dropdown no-arrow">
            <div class="nav-item dropdown no-arrow">
                <a class="dropdown-toggle nav-link"
                    aria-expanded="false" data-bs-toggle="dropdown" href="#"><span id="username"
                    class="d-inline me-2 text-gray-600 small">User</span></a>
                <div class="dropdown-menu shadow dropdown-menu-end animated--grow-in">
                    <a class="dropdown-item" href="profile.html">
                        <i class="fas fa-user fa-sm fa-fw me-2 text-gray-400"></i>&nbsp;Profile</a>
                    <div class="dropdown-divider"></div>
                    <a id="logout" class="dropdown-item" href="#">
                        <i class="fas fa-sign-out-alt fa-sm fa-fw me-2 text-gray-400"></i>&nbsp;Logout</a>
                </div>
            </div>
        </li>
    </ul>
</div>
    `;

$("#topPage").html(topPageTemplate);

}