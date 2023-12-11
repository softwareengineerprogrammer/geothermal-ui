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
    },
    methods: {
        downloadCsv: function(event) {
            alert(event.target.dataset.geophires_input_parameters)
        }
    }
}).mount('#app')
