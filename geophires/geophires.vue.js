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
        downloadURI: function (uri, name) {
            let link = document.createElement('a')
            link.download = name
            link.href = uri
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        },
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
                .then(data => {
                    console.debug('CSV download got data:',data)
                    this.downloadURI(`data:text/csv,${encodeURI(data['csv'])}`, 'geophires-result.csv')
                });
        }
    }
}).mount('#app')
