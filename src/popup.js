const copyBtn = document.getElementById("copy-btn");
const destUrl = document.getElementById("dest-url");
const errorTip = document.querySelector(".error-tip");

/**
 * validate error
 */
destUrl.addEventListener('input', (e) => {
    const v = e.target.value;
    const reg= /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/;
    let errorText = '';
    if (!v.trim().length) errorText = "target url can't be empty"
    else if (!reg.test(v)) errorText = "invalid target url"
    
    const isValidURL = reg.test(v);
    if (!isValidURL) errorTip.innerText = errorText;
    errorTip.style.display = !isValidURL ? 'block' : 'none';
    !isValidURL ? copyBtn.setAttribute('disabled', true) : copyBtn.removeAttribute('disabled')
})

copyBtn.addEventListener('click', async () => {
    const targetUrl = destUrl.value;
    try {
        // get current active page
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const turl = new URL(targetUrl);
        chrome.cookies.getAll(
            { domain: turl.hostname },
            (cookies) => {
                // copy all target domain cookies to current page's domain
                const ps = cookies.map(v =>  chrome.cookies.set({
                    url: new URL(tab.url).origin,
                    name: v.name,
                    value: v.value
                }))
                Promise.all(ps).then((data) => {
                    alert(JSON.stringify(data.map(v => v.name)) + '\nhad injected current page!');
                }).catch(e => alert(e)).finally(() => {
                    destUrl.value = '';
                })
            },
        )
    } catch(e) {
       alert(e);
    }
})
