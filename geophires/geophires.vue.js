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
        downloadCsv: function (event) {

            fetch(
                document.querySelector('#geophires_param_form').getAttribute('action'),
                {
                    method: 'POST',
                    body: JSON.stringify({
                        geophires_input_parameters: JSON.parse(event.target.dataset.geophires_input_parameters),
                        output_format: 'csv'
                    })
                }
            )
                .then(response => response.json())
                .then(data => alert(data));
        }
    }
}).mount('#app')
