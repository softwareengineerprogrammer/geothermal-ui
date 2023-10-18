import { createApp, ref } from 'vue'

function getLocationHost(){
    return location.hostname
}

createApp({
    data() {
        return {
            locationHost: getLocationHost(),
        }
    }
}).mount('#app')