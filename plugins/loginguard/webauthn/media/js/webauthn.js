/*
 * @package   AkeebaLoginGuard
 * @copyright Copyright (c)2016-2019 Nicholas K. Dionysopoulos / Akeeba Ltd
 * @license   GNU General Public License version 3, or later
 */

// Namespace
var akeeba = akeeba || {};

akeeba.LoginGuard = akeeba.LoginGuard || {};

akeeba.LoginGuard.webauthn = akeeba.LoginGuard.webauthn || {
    authData: null
};

/**
 * Ask the user to link an authenticator using the provided public key (created server-side).
 */
akeeba.LoginGuard.webauthn.setUp = function () {
    // Make sure the browser supports Webauthn
    if (!("credentials" in navigator))
    {
        alert(Joomla.JText._("PLG_LOGINGUARD_WEBAUTHN_ERR_NOTAVAILABLE_HEAD"));

        console.log("This browser does not support Webauthn");

        return;
    }

    let rawPKData = document.forms["loginguard-method-edit"].querySelectorAll('input[name="pkRequest"]')[0].value;
    let publicKey = JSON.parse(atob(rawPKData));

    // Utility function to convert array data to base64 strings
    function arrayToBase64String(a)
    {
        return btoa(String.fromCharCode(...a));
    }

    // Convert the public key infomration to a format usable by the browser's credentials managemer
    publicKey.challenge = Uint8Array.from(window.atob(publicKey.challenge), c => c.charCodeAt(0));
    publicKey.user.id   = Uint8Array.from(window.atob(publicKey.user.id), c => c.charCodeAt(0));

    if (publicKey.excludeCredentials)
    {
        publicKey.excludeCredentials = publicKey.excludeCredentials.map(function (data) {
            return {
                ...data,
                "id": Uint8Array.from(window.atob(data.id), c => c.charCodeAt(0))
            };
        });
    }

    // Ask the browser to prompt the user for their authenticator
    navigator.credentials.create({publicKey})
        .then(function (data) {
            let publicKeyCredential = {
                id:       data.id,
                type:     data.type,
                rawId:    arrayToBase64String(new Uint8Array(data.rawId)),
                response: {
                    clientDataJSON:    arrayToBase64String(new Uint8Array(data.response.clientDataJSON)),
                    attestationObject: arrayToBase64String(new Uint8Array(data.response.attestationObject))
                }
            };

            // Store the WebAuthn reply
            document.getElementById("loginguard-method-code").value = btoa(JSON.stringify(publicKeyCredential));

            // Submit the form
            document.forms["loginguard-method-edit"].submit();
        }, function (error) {
            // An error occurred: timeout, request to provide the authenticator refused, hardware / software error...
            akeeba.LoginGuard.webauthn.handle_error(error);
        });
};

akeeba.LoginGuard.webauthn.handle_error = function (message) {
    alert(message);

    console.log(message);
};

akeeba.LoginGuard.webauthn.validate = function()
{
    // Make sure the browser supports Webauthn
    if (!("credentials" in navigator))
    {
        alert(Joomla.JText._("PLG_LOGINGUARD_WEBAUTHN_ERR_NOTAVAILABLE_HEAD"));

        console.log("This browser does not support Webauthn");

        return;
    }

    function arrayToBase64String(a)
    {
        return btoa(String.fromCharCode(...a));
    }

    console.log(akeeba.LoginGuard.webauthn.authData);

    let publicKey = akeeba.LoginGuard.webauthn.authData;

    if (!publicKey.challenge)
    {
        akeeba.LoginGuard.webauthn.handle_error(Joomla.JText._('PLG_LOGINGUARD_WEBAUTHN_ERR_NO_STORED_CREDENTIAL'));

        return;
    }

    publicKey.challenge        = Uint8Array.from(window.atob(publicKey.challenge), c => c.charCodeAt(0));
    publicKey.allowCredentials = publicKey.allowCredentials.map(function (data) {
        return {
            ...data,
            "id": Uint8Array.from(atob(data.id), c => c.charCodeAt(0))
        };
    });

    navigator.credentials.get({publicKey})
        .then(data => {
            let publicKeyCredential = {
                id:       data.id,
                type:     data.type,
                rawId:    arrayToBase64String(new Uint8Array(data.rawId)),
                response: {
                    authenticatorData: arrayToBase64String(new Uint8Array(data.response.authenticatorData)),
                    clientDataJSON:    arrayToBase64String(new Uint8Array(data.response.clientDataJSON)),
                    signature:         arrayToBase64String(new Uint8Array(data.response.signature)),
                    userHandle:        data.response.userHandle ? arrayToBase64String(
                        new Uint8Array(data.response.userHandle)) : null
                }
            };

            document.getElementById('loginGuardCode').value = btoa(JSON.stringify(publicKeyCredential));
            document.forms['loginguard-captive-form'].submit();
        }, error => {
            // Example: timeout, interaction refused...
            console.log(error);
            akeeba.LoginGuard.webauthn.handle_error(error);
        });
};