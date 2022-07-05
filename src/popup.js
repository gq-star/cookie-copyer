const copyBtn = document.getElementById('copy-btn');
const copyUrl = document.getElementById('copy-url');
const destUrl = document.getElementById('dest-url');
const errorTip = document.querySelector('.error-tip');
const clearIcon = document.querySelector('.clear-icon-wrapper');

const STORAGE_KEY = 'copied_url';

const URL_Reg =
    /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/; // complete url
const DOMAIN_Reg =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/; // domain except ip
const IP_Reg =
    /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/; // match ip address

const LOCAL_URL_Reg =  /(http|https):\/\/localhost/  // match localhost url
const LOCAL_Reg = /^localhost$/;    // match localhost domain

/**
 * validate error
 */
destUrl.addEventListener('input', (e) => {
    const v = e.target.value;
    validateFn(v);
});

window.onload = async function () {
    const data = await getStorage(STORAGE_KEY);
    destUrl.value = data;
    validateFn(destUrl.value);
};

function validateFn(v) {
    let errorText = '';
    const regs = [URL_Reg, DOMAIN_Reg, IP_Reg, LOCAL_URL_Reg, LOCAL_Reg];
    if (!v.trim().length) errorText = '域名或链接不得不空';
    else if (regs.every(item => !item.test(v))) errorText = '无效的域名或链接';

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
    if (URL_Reg.test(v) || LOCAL_URL_Reg.test(v)) return new URL(v).hostname;
    if (DOMAIN_Reg.test(v) || IP_Reg.test(v) || LOCAL_Reg.test(v)) return v;
    throw new Error('无效域名');
}

async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    return tab;
}

function setStorage(key, value) {
    chrome.storage.sync.set({ [key]: value });
}

function getStorage(key) {
    return new Promise((resolve) => {
        chrome.storage.sync.get(key, function (result) {
            resolve(result[key] || '');
        });
    });
}

/**
 * reset logic
 */
function resetInput() {
    destUrl.value = '';
    setStorage(STORAGE_KEY, destUrl.value);
    validateFn(destUrl.value);
}

clearIcon.addEventListener('click', resetInput);

copyUrl.addEventListener('click', async () => {
    const tab = await getCurrentTab();
    destUrl.value = tab.url;
    setStorage(STORAGE_KEY, destUrl.value);
    validateFn(destUrl.value);
});

copyBtn.addEventListener('click', async () => {
    try {
        // get current active page
        const tab = await getCurrentTab();
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
                            'cookies: ' + 
                            JSON.stringify(data.map((v) => v.name)) +
                                '\n已成功注入到当前页面!'
                        );
                    })
                    .catch((e) => alert(e))
                    .finally(() => {
                        resetInput();
                    });
            }
        );
    } catch (e) {
        alert(e);
    }
});
