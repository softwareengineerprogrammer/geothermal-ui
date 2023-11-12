import {createApp, ref} from 'vue'


function getLocationHost() {
    return location.hostname
}

function getLocationOrigin() {
    return location.origin
}

createApp({
    data() {
        return {
            locationOrigin: `${getLocationOrigin()}?ref=geophires-ui`,
            locationHost: getLocationHost()
        }
    }
}).mount('#app')
