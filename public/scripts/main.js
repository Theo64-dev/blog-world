$(".view-btn").click((event) => {
    const index = event.currentTarget.id;
    window.location.href = `/blog?id=${index}`;
});

$(".edit-btn").click((event) => {
    const index = event.currentTarget.id;
    window.location.href = `/edit?id=${index}`;
});

$(".delete-btn").click((event) => {
    const index = event.currentTarget.id;
    
    if (confirm("Are you sure you want to delete this blog?")) {
        fetch(`/delete?id=${index}`, {
            method: 'DELETE',
        })
        .then((res) => {
            if (res.ok) {
                window.location.href = '/';
            } else {
                alert("Failed to delete the blog. Please try again.");
            }
        })
        .catch((err) => {
            console.error('Error deleting blog:', err);
            alert("An error occurred while deleting the blog.");
        });
    }
});