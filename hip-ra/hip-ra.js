import { createApp, ref } from 'vue'

function getLocationHost(){
    return location.hostname
}

function getLocationOrigin(){
    return location.origin
}

createApp({
    data() {
        return {
            locationHost: getLocationHost(),
            locationOrigin: getLocationOrigin()
        }
    }
}).mount('#app')