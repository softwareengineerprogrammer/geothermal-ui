import {createApp, ref} from 'vue'


function getLocationHost() {
    return location.hostname
}

function getLocationOrigin() {
    return location.origin
}

function submitHipRa() {
    console.log('HIP RA submitted')
}



createApp({
    data() {
        return {
            locationHost: getLocationHost(),
            locationOrigin: getLocationOrigin(),
            hipRaInputText: ref(`Reservoir Temperature, 250.0
Rejection Temperature, 60.0
Formation Porosity, 10.0
Reservoir Area, 55.0
Reservoir Thickness, 0.25
Reservoir Life Cycle, 25
Heat Capacity Of Water, -1
Density Of Water, -1`),
            hipRaResult: ref('Run HIP RA to get a result'),
            errorMessage: ref(''),
            hipRaLoading: ref(false),
        }
    },
    methods: {
        submitHipRa() {
            /*
            action="https://d4nshmdoig.execute-api.us-west-2.amazonaws.com/get-hip-ra-result"
            method="POST"
            */
            this.errorMessage = ''
            this.hipRaResult = ''

            console.log('HIP RA submitted')
            console.log('HIP RA input text is:', this.hipRaInputText)

            let params = {}
            try {
                this.hipRaInputText.split('\n').forEach(it => {
                    let kv = it.trim().split(',')
                    let name = kv[0].trim()
                    let value = kv[1].trim()
                    params[name] = value
                })
                console.log('Parsed params as:',params)
            } catch(e) {
                console.log('Error parsing params:',e)
                this.errorMessage = 'Failed to parse parameters'
                return false
            }

            this.hipRaLoading = true
            let apigId = 'nmgmk2gu5b'
            if(getLocationHost().indexOf('localhost') != -1){
                apigId = 'd4nshmdoig'
            }

            fetch(
                `https://${apigId}.execute-api.us-west-2.amazonaws.com/get-hip-ra-result`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        hip_ra_input_parameters: params
                    })
                }
            ).then(response => {
                    console.log('Response:',response)
                    this.hipRaLoading = false

                    response.json().then( responseJson => {
                        console.log('Response body:\n',responseJson)
                        this.hipRaLoading = false

                        if(!response.ok){
                            this.errorMessage = `Error: ${responseJson['error']}`
                        } else {
                            this.hipRaResult = responseJson['caseReportText']
                        }
                    })
                })
        }
    }
}).mount('#app')
