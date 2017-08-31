function startApp() {

    $('.notification').click(function () {
        $(this).hide();
    });

    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    });

    hideNavLinks();
    showViewWelcome();

    $('#catalogView').click(showCatalogView);
    $('#submitLinkView').click(showSubmitView);
    $('#myPostsView').click(showMyPostsView);

    $('#logout').click(logout);

    $('#registerForm').submit(register);
    $('#loginForm').submit(login);
    $('#submitForm').submit(createPost);
    $('#editPostForm').submit(editPost);
    $('#commentForm').submit(createComment);


    function showView(name){
        $('section').hide();
        $('#view' + name).show();
    }

    function showViewWelcome() {
        showView('Welcome');
    }

    function showCatalogView() {
        showView('Catalog');
        loadPosts();
    }
    function showSubmitView() {
        showView('Submit');
    }
    function showMyPostsView() {
        showView('MyPosts');
        loadMyPosts();
    }
    function showEditPostView() {
        showView('Edit');
        let postId = $(this).parent().parent().attr('data-id');
        postService.getPost(postId)
            .then(function (postInfo) {
                $('#editPostForm input[name=id]').val(postId);
                $('#editPostForm input[name=url]').val(postInfo.url);
                $('#editPostForm input[name=title]').val(postInfo.title);
                $('#editPostForm input[name=image]').val(postInfo.imageUrl);
                $('#editPostForm textarea[name=description]').val(postInfo.description);
            }).catch(handleError);
    }
    function showViewComments() {
        showView('Comments');
        let postId = $(this).parent().parent().attr('data-id');
        postService.getPost(postId)
            .then(function (post) {
                createOnePost(post);
                loadComments(postId);
                $('#commentForm input[name=id]').val(postId);
            }).catch(handleError);
    }

    function register(e) {
        e.preventDefault();
        let username = $('#registerForm input[name=username]').val();
        let password = $('#registerForm input[name=password]').val();
        let repeatPass = $('#registerForm input[name=repeatPass]').val();

        let patternUsername = new RegExp('^[a-zA-Z]{3,}$');
        let patternPassword = new RegExp('^[a-zA-Z0-9]{6,}$');

        if (!patternUsername.test(username)) {
            showError("A username should be at least 3 characters long and should contain only " +
                "english alphabet letters");
            return;
        }
        if (!patternPassword.test(password)) {
            showError("Password should be at least 6 characters long and should contain only " +
                "english alphabet letters and digits");
            return;
        }
        if (password !== repeatPass) {
            showError('Password do not match');
            return;
        }

        auth.register(username, password)
            .then(function (userInfo) {
                saveSession(userInfo);
                showInfo('User registration successful.');
                showCatalogView();
                hideNavLinks();
                $('#registerForm').trigger('reset');
            }).catch(handleError);
    }
    function login(e) {
        e.preventDefault();
        let username = $('#loginForm input[name=username]').val();
        let password = $('#loginForm input[name=password]').val();

        let patternUsername = new RegExp('^[a-zA-Z]{3,}$');
        let patternPassword = new RegExp('^[a-zA-Z0-9]{6,}$');

        if (!patternUsername.test(username)) {
            showError("A username should be at least 3 characters long and should contain only " +
                "english alphabet letters");
            return;
        }
        if (!patternPassword.test(password)) {
            showError("Password should be at least 6 characters long and should contain only " +
                "english alphabet letters and digits");
            return;
        }

        auth.login(username, password)
            .then(function (userInfo) {
                saveSession(userInfo);
                showInfo('Login successful.');
                showViewWelcome();
                hideNavLinks();
                $('#loginForm').trigger('reset');
            }).catch(handleError);
    }
    function logout() {
        auth.logout()
            .then(function (response) {
                sessionStorage.clear();
                showInfo('Logout successful.');
                showViewWelcome();
                hideNavLinks();
            }).catch(handleError)
    }

    function createComment(e) {
        e.preventDefault();
        let id = $('#commentForm input[name=id]').val();
        let comment = $('#commentForm textarea[name=content]').val();
        let data = {
            author: sessionStorage.getItem('username'),
            content: comment,
            postId: id
        };
        postService.createComment(data)
            .then(function (data) {
                console.log("dasdasd");
                showInfo('Comment created.');
                showCatalogView();
            }).catch(handleError);

    }
    function loadComments(id) {
        let commentContent =  $('article.post-content');
        commentContent.remove();
        postService.getComments(id)
            .then(function (comments) {
                for (let comment of comments) {
                    let commentArticle = $('<article class="post post-content">');
                    commentArticle.append($('<p>').text(comment.content));
                    let infoDiv = $('<div class="info">');
                    infoDiv.append(`submitted ${calcTime(comment._kmd.ect)} ago by ${comment.author}`);
                    if (comment._acl.creator === sessionStorage.getItem('id')) {
                        infoDiv.append(` | <a href="#" data-id="${comment._id}" class="deleteLink">delete</a>`)
                    }
                    commentArticle.append(infoDiv);
                    commentArticle.appendTo($('#viewComments'));
                }
            })
            .then(function () {
                $('.deleteLink').click(deleteComment);
            }).catch(handleError);
    }
    function deleteComment() {
        let patent = $(this).parent().parent().remove();
        let id = $(this).attr('data-id');
        postService.deleteComment(id)
            .then(function (data) {
                showInfo('Comment delete.');
                patent.remove();
            }).catch(handleError);

    }
    function loadMyPosts() {
        postService.getMyPosts()
            .then(function (posts) {
                createPostArticles(posts, '.posts');
            }).then(function () {
            $('.editLink').click(showEditPostView);
            $('.deleteLink').click(deletePost);
            $('.commentsLink').click(showViewComments);
        }).catch(handleError);
    }
    function loadPosts() {
        postService.getAllPosts()
            .then(function (posts) {
                createPostArticles(posts, '.posts');
            }).then(function () {
            $('.editLink').click(showEditPostView);
            $('.deleteLink').click(deletePost);
            $('.commentsLink').click(showViewComments);
        }).catch(handleError);
    }
    function createPost(e) {
        e.preventDefault();
        let author = sessionStorage.getItem('username');
        let url = $('#submitForm input[name=url]').val();
        let title = $('#submitForm input[name=title]').val();
        let imageUrl = $('#submitForm input[name=image]').val();
        let description = $('#submitForm textarea[name=comment]').val();

        if (url.length == 0) {
            showError('Link URL cannot be empty');
            return;
        }
        if (title.length == 0) {
            showError('Link Title cannot be empty');
            return;
        }
        if (!url.startsWith('http')) {
            showError('Link URL must start with "http"');
            return
        }
        if (imageUrl.length > 0 && !imageUrl.startsWith('http')) {
            showError('Link Thumbnail Image must start with "http"');
            return
        }

        let data = {
            author,
            url,
            title,
            imageUrl,
            description
        };

        postService.createPost(data)
            .then(function (postInfo) {
                showInfo('Post created.');
                showCatalogView();
                $('#submitForm').trigger('reset');
            }).catch(handleError);

    }
    function editPost(e) {
        e.preventDefault();
        let author = sessionStorage.getItem('username');
        let url = $('#editPostForm input[name=url]').val();
        let title = $('#editPostForm input[name=title]').val();
        let imageUrl = $('#editPostForm input[name=image]').val();
        let description = $('#editPostForm textarea[name=comment]').val();
        let id = $('#editPostForm input[name=id]').val()

        if (url.length == 0) {
            showError('Link URL cannot be empty');
            return;
        }
        if (title.length == 0) {
            showError('Link Title cannot be empty');
            return;
        }
        if (!url.startsWith('http')) {
            showError('Link URL must start with "http"');
            return
        }
        if (imageUrl.length > 0 && !imageUrl.startsWith('http')) {
            showError('Link Thumbnail Image must start with "http"');
            return
        }

        let data = {
            author,
            url,
            title,
            imageUrl,
            description
        };

        postService.editPost(id, data)
            .then(function (response) {
                showInfo(`Post ${title} updated.`);
                showCatalogView();
                $('#editPostForm').trigger('reset');
            }).catch(handleError);
    }
    function deletePost() {
        let postId = $(this).parent().parent().attr('data-id');
        postService.deletePost(postId)
            .then(function (response) {
                showInfo('Post deleted.');
                showCatalogView();
            }).catch(handleError);
    }

    function createOnePost(post) {
        let divThumbnail = $('<div class="col thumbnail">');
        let href = post.url ? post.url : "#";
        let aHref = $(`<a href="${href}">`);
        aHref.append(`<img src="${post.imageUrl}">`);
        divThumbnail.append(aHref);

        let divPostContent = $('<div class="post-content">');
        let title = $('<div class="title">')
            .append($(`<a href="${href}">`).text(post.title));
        let timePublish = calcTime(post._kmd.ect);
        let details = $(`<div class="details">`);
        let info = $('<div class="info">')
            .text(`submitted ${timePublish} ago by ${post.author}`);
        let controls = $('<div class="controls">');
        let postId = post._id;
        let ulControls = $(`<ul data-id="${postId}">`);

        if (post._acl.creator === sessionStorage.getItem('id')) {
            ulControls.append('<li class="action"><a class="editLink" href="#">edit</a></li>');
            ulControls.append('<li class="action"><a class="deleteLink" href="#">delete</a></li>');
        }

        controls.append(ulControls);
        details.append(info);
        details.append(controls);
        divPostContent.append(title);
        divPostContent.append(details);

        let content = $('#viewComments #postComment');
        content.empty();
        content.append(divThumbnail);
        content.append(divPostContent);
        content.append('<div class="clear"></div>');
    }
    function createPostArticles(posts, contentName) {
        let postContent = $(contentName);
        postContent.empty();
        if (posts.length == 0) {
            postContent.text('No posts in database');
            return;
        }
        let countRank = 0;
        for (let post of posts) {
            let article = $('<article class="post">');

            let divColRank = $('<div class="col rank">');
            divColRank.append(`<span>${++countRank}</span>`);

            let divThumbnail = $('<div class="col thumbnail">');
            let href = post.url ? post.url : "#";
            let aHref = $(`<a href="${href}">`);
            aHref.append(`<img src="${post.imageUrl}">`);
            divThumbnail.append(aHref);

            let divPostContent = $('<div class="post-content">');
            let title = $('<div class="title">')
                .append($(`<a href="${href}">`).text(post.title));
            let timePublish = calcTime(post._kmd.ect);
            let details = $(`<div class="details">`);
            let info = $('<div class="info">')
                .text(`submitted ${timePublish} ago by ${post.author}`);
            let controls = $('<div class="controls">');
            let postId = post._id;
            let ulControls = $(`<ul data-id="${postId}">`);
            ulControls.append('<li class="action"><a class="commentsLink" href="#">comments</a></li>');
            if (post._acl.creator === sessionStorage.getItem('id')) {
                ulControls.append('<li class="action"><a class="editLink" href="#">edit</a></li>');
                ulControls.append('<li class="action"><a class="deleteLink" href="#">delete</a></li>');
            }
            controls.append(ulControls);
            details.append(info);
            details.append(controls);
            divPostContent.append(title);
            divPostContent.append(details);

            article.append(divColRank);
            article.append(divThumbnail);
            article.append(divPostContent);
            article.appendTo(postContent);
        }
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

    function hideNavLinks() {
        if (sessionStorage.getItem('username') &&
            sessionStorage.getItem('username').length !== 0) {
            $('#menu, #profile').show();
            $('.signup').hide();
            $('#profile').find('span').text(sessionStorage.getItem('username'));
        } else {
            $('#menu, #profile').hide();
            $('.signup').show();
            $('#profile').find('span').text("");
        }
    }

    function saveSession(data) {
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('authtoken', data._kmd.authtoken);
        sessionStorage.setItem('id', data._id);
    }

    function handleError(response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0)
            errorMsg = "Cannot connect due to network error.";
        if (response.responseJSON &&
            response.responseJSON.description)
            errorMsg = response.responseJSON.description;
        showError(errorMsg);
    }
    function showInfo(message) {
        $('#infoBox span').text(message);
        $('#infoBox').show();
        setTimeout(function () {
            $('#infoBox').fadeOut();
        }, 3000);
    }
    function showError(errorMsg) {
        $('#errorBox span').text("Error: " + errorMsg);
        $('#errorBox').show();
    }
}