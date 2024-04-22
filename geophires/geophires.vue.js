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
            locationHost: getLocationHost(),
            isCsvDownloading: ref(false)
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
            if(!this.isCsvDownloading) {
                this.isCsvDownloading = ref(true)
                fetch(
                    document.querySelector('#geophires_param_form').getAttribute('action'),
                    {
                        method: 'POST',
                        headers: {
                            'x-api-key': _UI_KEY,
                        },
                        body: JSON.stringify({
                            geophires_input_parameters: JSON.parse(event.target.dataset.geophires_input_parameters),
                            output_format: 'csv'
                        })
                    }
                )
                    .then(response => {
                        this.isCsvDownloading = ref(false)
                        console.debug('CSV download got response:', response)
                        return response.json()
                    })
                    .then(data => {
                        this.downloadURI(`data:text/csv,${encodeURI(data['csv'])}`, 'geophires-result.csv')
                    });
            }
        }
    }
}).mount('#app')
