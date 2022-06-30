const copyBtn = document.getElementById('copy-btn');
const destUrl = document.getElementById('dest-url');
const errorTip = document.querySelector('.error-tip');

const urlReg =
    /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/; // complete url
const domainReg =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/; // domain except ip
const ipReg =
    /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/; // match ip address

/**
 * validate error
 */
destUrl.addEventListener('input', (e) => {
    const v = e.target.value;
    validateFn(v);
});

window.onload = function () {
    validateFn(destUrl.value);
};

function validateFn(v) {
    let errorText = '';
    if (!v.trim().length) errorText = "target url can't be empty";
    else if (!urlReg.test(v) && !domainReg.test(v) && !ipReg.test(v))
        errorText = 'invalid url or domain';

    if (errorText) errorTip.innerText = errorText;
    errorTip.style.display = errorText ? 'block' : 'none';
    errorText
        ? copyBtn.setAttribute('disabled', true)
        : copyBtn.removeAttribute('disabled');
}

/**
 * get legal domain
 */
function getDomain(v) {
    if (urlReg.test(v)) return new URL(v).hostname;
    if (domainReg.test(v) || ipReg.test(v)) return v;
    throw new Error('invalid domain');
}

copyBtn.addEventListener('click', async () => {
    try {
        // get current active page
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });
        chrome.cookies.getAll(
            { domain: getDomain(destUrl.value) },
            (cookies) => {
                // copy all target domain cookies to current page's domain
                const ps = cookies.map((v) =>
                    chrome.cookies.set({
                        url: new URL(tab.url).origin,
                        name: v.name,
                        value: v.value
                    })
                );
                Promise.all(ps)
                    .then((data) => {
                        alert(
                            JSON.stringify(data.map((v) => v.name)) +
                                '\nhad injected current page!'
                        );
                    })
                    .catch((e) => alert(e))
                    .finally(() => {
                        destUrl.value = '';
                    });
            }
        );
    } catch (e) {
        alert(e);
    }
});
