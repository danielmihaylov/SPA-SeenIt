let postService = (() => {

    function getAllPosts() {
        return requester.get('appdata', 'posts?query={}&sort={"_kmd.ect": -1}', 'kinvey');
    }

    function createPost(data) {
        return requester.post('appdata', 'posts', 'kinvey', data);
    }

    function getPost(id) {
        return requester.get('appdata', 'posts/' + id, "kinvey");
    }

    function editPost(id, data) {
        return requester.update('appdata', 'posts/' + id, 'kinvey', data);
    }

    function deletePost(id) {
        return requester.remove('appdata', 'posts/' + id, 'kinvey')
    }
    
    function getMyPosts() {
        return requester.get('appdata',
            `posts?query={"author":"${sessionStorage.getItem('username')}"}&sort={"_kmd.ect": -1}`,
            'kinvey');
    }

    function getComments(id) {
        return requester.get('appdata', `comments?query={"postId":"${id}"}&sort={"_kmd.ect": -1}`);
    }
    
    function createComment(data) {
        return requester.post('appdata', 'comments', 'kinvey', data);
    }

    function deleteComment(id) {
        return requester.remove('appdata', 'comments/' + id, 'kinvey');
    }

    return {
        getAllPosts,
        createPost,
        getPost,
        editPost,
        deletePost,
        getMyPosts,
        getComments,
        createComment,
        deleteComment,
    };
})();