document.addEventListener('DOMContentLoaded', function() {
    const runButton = document.getElementById('runButton');
    const codeInput = document.getElementById('codeInput');
    const outputWindow = document.getElementById('outputWindow');
    const createFileButton = document.getElementById('createFileButton');
    const fileNameInput = document.getElementById('fileName');
    const fileList = document.getElementById('fileList');
    const imageInput = document.getElementById('imageInput');
    const addImageButton = document.getElementById('addImageButton');
    const imageList = document.getElementById('imageList');
    const resetButton = document.getElementById('resetButton');

    let files = JSON.parse(localStorage.getItem('files')) || {
        'index.html': '<!-- New file - add your HTML code here -->',
        'style.css': '/* Add your CSS here */'
    };

    let images = JSON.parse(localStorage.getItem('images')) || {};

    function addFileToList(fileName) {
        const listItem = document.createElement('li');
        listItem.textContent = fileName;
        listItem.addEventListener('click', function() {
            codeInput.value = files[fileName];
            highlightSelectedFile(listItem);
        });
        fileList.appendChild(listItem);
    }

    function highlightSelectedFile(selectedItem) {
        const items = fileList.querySelectorAll('li');
        items.forEach(item => item.classList.remove('selected-file'));
        selectedItem.classList.add('selected-file');
    }

    function addImageToList(imageName) {
        const listItem = document.createElement('li');
        listItem.textContent = imageName;
        imageList.appendChild(listItem);
    }

    // Load files and images from local storage
    Object.keys(files).forEach(addFileToList);
    Object.keys(images).forEach(addImageToList);

    // Set default file
    codeInput.value = files['index.html'];
    highlightSelectedFile(fileList.querySelector('li'));

    runButton.addEventListener('click', function() {
        const code = codeInput.value;
        const fileName = fileList.querySelector('.selected-file').textContent;
        if (fileName && files[fileName] !== undefined) {
            files[fileName] = code;
            localStorage.setItem('files', JSON.stringify(files));
            if (fileName.endsWith('.html')) {
                const doc = new DOMParser().parseFromString(code, 'text/html');
                const styleLink = doc.querySelector('link[rel="stylesheet"]');
                if (styleLink && styleLink.getAttribute('href') === 'css/style.css') {
                    const style = doc.createElement('style');
                    style.textContent = files['style.css'];
                    doc.head.appendChild(style);
                }
                outputWindow.srcdoc = doc.documentElement.outerHTML;
            } else {
                outputWindow.srcdoc = code;
            }
            setTimeout(interceptLinks, 100); // Ensure links are intercepted after loading
        }
    });

    createFileButton.addEventListener('click', function() {
        const fileName = fileNameInput.value.trim();
        if (fileName && !files[fileName]) {
            files[fileName] = fileName.endsWith('.css') ? '/* Add your CSS here */' : '<!-- New file - add your HTML code here -->';
            addFileToList(fileName);
            localStorage.setItem('files', JSON.stringify(files));
            fileNameInput.value = '';
        }
    });

    addImageButton.addEventListener('click', function() {
        const file = imageInput.files[0];
        if (file) {
            const imageName = file.name;
            const reader = new FileReader();
            reader.onload = function(event) {
                images[imageName] = event.target.result;
                addImageToList(imageName);
                localStorage.setItem('images', JSON.stringify(images));
                alert(`Image ${imageName} added. You can use it with <img src="${imageName}">`);
            };
            reader.readAsDataURL(file);
        }
    });

    resetButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the playground? This will clear all your files and images.')) {
            localStorage.clear();
            location.reload();
        }
    });

    codeInput.addEventListener('input', function() {
        const fileName = fileList.querySelector('.selected-file').textContent;
        if (fileName && files[fileName] !== undefined) {
            files[fileName] = codeInput.value;
            localStorage.setItem('files', JSON.stringify(files));
        }
    });

    function interceptLinks() {
        const iframeDocument = outputWindow.contentDocument || outputWindow.contentWindow.document;
        const links = iframeDocument.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const href = link.getAttribute('href');
                if (files[href]) {
                    codeInput.value = files[href];
                    highlightSelectedFile([...fileList.children].find(item => item.textContent === href));
                    outputWindow.srcdoc = files[href];
                    setTimeout(interceptLinks, 100); // Re-intercept links after loading new content
                }
            });
        });

        const imgs = iframeDocument.querySelectorAll('img');
        imgs.forEach(img => {
            const src = img.getAttribute('src');
            if (images[src]) {
                img.src = images[src];
            }
        });
    }
});








