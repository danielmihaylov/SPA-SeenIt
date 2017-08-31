//default
$(() => {
    hideShowLinks();
    showView('Welcome');
    (() => {

        $('#registerForm').submit(registerUser);
        $('#loginForm').submit(loginUser);
        $('#logout').click(logoutUser);
        $('#catalogView').click(() => {
            showView('Catalog');
        });
        $('#linkView').click(() => {
           showView('Submit');
        });
        $('#myPostsView').click(() => {
            showView('MyPosts');
        })
    })();

    function logoutUser(ev) {
        ev.preventDefault();

        auth.logout().then(() => {
            sessionStorage.clear();
            showInfo('LoggedOut successful.');
            showView('Welcome');
            hideShowLinks();
        }).catch(handleError);

    }

    //default
    function loginUser(ev) {
        ev.preventDefault();
        let inputUsername = $('#loginForm input[name=username]');
        let inputPassword = $('#loginForm input[name=password]');

        let usernameVal = inputUsername.val();
        let passwdVal = inputPassword.val();

        let usernameValid = new RegExp('^[A-Za-z0-9]{3,}$');
        let passwordValid = new RegExp('^[A-Za-z0-9]{6,}$');

        if(!usernameValid.test(usernameVal)){
            showError("A username should be at least 3 characters long and should contain only " +
                "english alphabet letters");
            return;
        }

        if(!passwordValid.test(passwdVal)){
            showError("A password should be at least 6 characters long and should contain only " +
                "english alphabet letters");
            return;
        }

        auth.login(usernameVal, passwdVal)
            .then((userInfo) => {
                saveSession(userInfo);
                showInfo('Login successful.');
                showView('Welcome');
                hideShowLinks();
                inputUsername.val('');
                inputPassword.val('');
            }).catch(handleError);
    }
    //default
    function registerUser(event) {
        event.preventDefault();
        let registerUsername = $('#registerForm input[name=username]').val();
        let registerPassword = $('#registerForm input[name=password]').val();
        let registerRepeatPassword = $('#registerForm input[name=repeatPass]').val();

        let usernameValid = new RegExp('^[A-Za-z0-9]{3,}$');
        let passwordValid = new RegExp('^[A-Za-z0-9]{6,}$');

        if(!usernameValid.test(registerUsername)){
            showError("A username should be at least 3 characters long and should contain only " +
                "english alphabet letters");
            return;
        }

        if(!passwordValid.test(registerPassword)){
            showError("A password should be at least 6 characters long and should contain only " +
                "english alphabet letters");
            return;
        }

        auth.register(registerUsername,registerPassword,registerRepeatPassword)
            .then((userInfo) => {
                saveSession(userInfo);
                showInfo('User registration successful.');
                showView('Catalog');
                hideShowLinks();
                $('#registerForm').trigger('reset');
            }).catch(handleError);
    }

    function hideShowLinks() {
        if(sessionStorage.getItem('username') &&
          sessionStorage.getItem('username').length !==0){
            $('#menu, #profile').show();
            $('.signup').hide();
            $('#profile').find('span').text(sessionStorage.getItem('username'));
        }else{
            $('#menu, #profile').hide();
            $('.signup').show();
            $('#profile').find('span').text("");
        }
    }

    // if(sessionStorage.getItem('authtoken') === null){
    //     userLoggedOut();
    // }else{
    //     userLoggedIn();
    // }
    //
    // function userLoggedOut() {
    //     $('#profile').hide();
    //     $('#profile').text('');
    //     showView('Welcome');
    // }
    //
    // function userLoggedIn() {
    //     let username = sessionStorage.getItem('username');
    //     $('#profile').find('span').text(username);
    //     //$('#profile').html(`${username} | logout`);
    //     showView('Catalog');
    //     $('#menu').show();
    //     $('#profile').show();
    // }
    //default
    function showView(viewName) {
        $('section').hide();
        $('#view' + viewName).show();
        //$('#menu').hide();
    }
    //default
    function saveSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authtoken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        let username = userInfo.username;
        sessionStorage.setItem('username', username);
       // userLoggedIn();
    }
    //default
    function handleError(reason) {
        showError(reason.responseJSON.description);
    }
    //default
    function showInfo(message) {
        let infoBox = $('#infoBox');
        infoBox.text(message);
        infoBox.show();
        setTimeout(() => infoBox.fadeOut(), 3000);
    }
    //default
    function showError(message) {
        let errorBox = $('#errorBox');
        errorBox.text(message);
        errorBox.show();
        setTimeout(() => errorBox.fadeOut(), 3000);
    }

    function calcTime(dateIsoFormat) {
        let diff = new Date - (new Date(dateIsoFormat));
        diff = Math.floor(diff / 60000);
        if (diff < 1) return 'less than a minute';
        if (diff < 60) return diff + ' minute' + pluralize(diff);
        diff = Math.floor(diff / 60);
        if (diff < 24) return diff + ' hour' + pluralize(diff);
        diff = Math.floor(diff / 24);
        if (diff < 30) return diff + ' day' + pluralize(diff);
        diff = Math.floor(diff / 30);
        if (diff < 12) return diff + ' month' + pluralize(diff);
        diff = Math.floor(diff / 12);
        return diff + ' year' + pluralize(diff);
        function pluralize(value) {
            if (value !== 1) return 's';
            else return '';
        }
    }

    //default
    $(document).on({
        ajaxStart: function () {
            $('#loadingBox').show();
        },
        ajaxStop: function () {
            $('#loadingBox').fadeOut();
        }
    })
});
