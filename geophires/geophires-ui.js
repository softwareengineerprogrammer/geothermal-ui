function setLoading(isLoading) {
    let loader = document.getElementById('loading')
    if (isLoading) {
        setVisible(loader, true)
        resetGenerationProfileGraphs()
    } else {
        setVisible(loader, false)
    }

    document.querySelectorAll('form input').forEach(
        (sb) => setInputEnabled(sb, !isLoading))

    document.querySelectorAll('form textarea').forEach(
        (ta) => setInputEnabled(ta, !isLoading))
}

function showError(msg) {
    setLoading(false)
    $('#results').html(`<span class="mui--text-danger">&#9888;${msg}</span>`)
}

function resetGenerationProfileGraphs() {
    setVisible(document.getElementById('generation-profile-graphs'), false)
}

function renderGenerationProfileGraphs(resultsData) {
    setVisible(document.getElementById('generation-profile-graphs'), true)

    let powerGenerationProfile = resultsData['POWER GENERATION PROFILE']

    let powerGenerationProfileChart = new google.visualization.LineChart(
        document.getElementById('power-generation-profile-chart')
    );

    powerGenerationProfileChart.draw(
        google.visualization.arrayToDataTable(powerGenerationProfile),
        {
            title: 'POWER GENERATION PROFILE',
            curveType: 'function',
            legend: {position: 'bottom'},
            hAxis: {
                title: 'Year'
            },
            series: {
                // Gives each series an axis name that matches the Y-axis below.
                0: {targetAxisIndex: 1}
            },

            // TODO generate vAxes programmatically from profiles instead of hardcoding
            vAxes: {
                // Adds titles to each axis.
                0: {title: '\u2103; MW'},
                1: {title: 'Drawdown'}
            },
        }
    );


    let heatElectricityExtractionGenerationProfile = resultsData['HEAT AND/OR ELECTRICITY EXTRACTION AND GENERATION PROFILE']
    let heatElectricityExtractionGenerationProfileChart = new google.visualization.LineChart(
        document.getElementById('heat-electricity-extraction-generation-profile-chart')
    );

    heatElectricityExtractionGenerationProfileChart.draw(
        google.visualization.arrayToDataTable(heatElectricityExtractionGenerationProfile),
        {
            title: 'HEAT AND/OR ELECTRICITY EXTRACTION AND GENERATION PROFILE',
            curveType: 'function',
            legend: {position: 'bottom'},
            hAxis: {
                title: 'Year'
            },
            series: {
                // Gives each series an axis name that matches the Y-axis below.
                3: {targetAxisIndex: 1}
            },
            vAxes: {
                // Adds titles to each axis.
                0: {title: 'GWh/year; 10^15 J'},
                1: {title: 'Percent'}
            },
        }
    );

}

function submitForm(oFormElement) {
    let parsed_params = JSON.parse(oFormElement.querySelector('textarea[name="geophires_input_parameters"]').value)

    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
        console.log('Got response', xhr.responseText, xhr)
        setLoading(false)

        let resultsText = ''
        if (xhr.status !== 200) {
            let errorMsg = `${xhr.statusText}`
            try {
                errorMsg += `: ${JSON.parse(xhr.responseText)['error']}`
            } catch (e) {
                console.warn('Unable to extract error from response body', xhr)
            }
            showError(errorMsg)
            return
        } else {
            resultsText = xhr.responseText
        }

        let resultsTable = $('<table class="mui-table"></table>')

        let resultsData = JSON.parse(resultsText)

        let powerProfileKey = 'POWER GENERATION PROFILE'
        let extractionProfileKey = 'HEAT AND/OR ELECTRICITY EXTRACTION AND GENERATION PROFILE'

        let resultsDisplayData = Object.assign({}, resultsData)
        delete resultsDisplayData[powerProfileKey]
        delete resultsDisplayData[extractionProfileKey]

        for (let resultsKey in resultsDisplayData) {
            let resultsEntry = resultsDisplayData[resultsKey]
            if(resultsEntry && Reflect.ownKeys(resultsEntry).length){
                // I'm sure there's a one-liner for this...
                allNull = true
                for(let k in resultsEntry){
                    if(resultsEntry[k] !== null){
                        allNull = false
                        break
                    }
                }

                if(!allNull){
                    $(resultsTable).append($(`<thead><tr><th colspan="2">${resultsKey}</th></tr></tr></thead>`))
                    $(resultsTable).append(getTbody(resultsEntry))
                }
            }
        }

        $('#results').empty()
            .append(resultsTable)

        renderGenerationProfileGraphs(resultsData)
    }

    xhr.onerror = function () {
        console.log('xhr onerror triggered', xhr)
        showError('Unexpected GEOPHIRES error - could be caused by invalid GEOPHIRES parameters, i.e. Maximum Temperature > 400')
    }

    xhr.open(oFormElement.method, oFormElement.getAttribute("action"))
    xhr.send(JSON.stringify({
        'geophires_input_parameters': parsed_params
    }))

    setLoading(true)
    $('#results').empty()

    let hashParams = new URLSearchParams()
    hashParams.set('geophires_input_parameters', JSON.stringify(parsed_params))
    setUrlHash(hashParams.toString())

    return false
}

let GUIDED_PARAMS_FORM = null
let TEXT_INPUT_PARAMS_FORM = null

function setFormInputParameters(inputParameterObj) {
    GUIDED_PARAMS_FORM.setInputParameters(inputParameterObj)
    TEXT_INPUT_PARAMS_FORM.setInputParameters(inputParameterObj)
}

function configureExampleSelector(){
    $('#run-example-btn').on('click', function(){
        let exampleFile = $('#examples-selector').val()
        console.log('Example',exampleFile,'clicked')
        $.get('examples/'+exampleFile,function(data){
        console.log('Got example data',data)
         $('#geophires_text_input_parameters textarea').val(data)
         setTimeout(function(){
            $('#geophires_text_input_parameters').submit()
            mui.tabs.activate('pane-default-3')
         }, 100)
        })
    })


    // FIXME re-enable commented examples once they are working in Lambda
    let exampleFiles = [
        'example1.txt',
        'example1_outputunits.txt',
        'example2.txt',
        'example3.txt',
        'example4.txt',
        'example5.txt',
        'example8.txt',
        'example9.txt',
        'example10_HP.txt',
        'example11_AC.txt',
        'Beckers_et_al_2023_Tabulated_Database_Coaxial_sCO2_heat.txt',
        // 'Beckers_et_al_2023_Tabulated_Database_Coaxial_water_heat.txt',
        'Beckers_et_al_2023_Tabulated_Database_Uloop_sCO2_elec.txt',
        'Beckers_et_al_2023_Tabulated_Database_Uloop_sCO2_heat.txt',
        // 'Beckers_et_al_2023_Tabulated_Database_Uloop_water_elec.txt',
        // 'Beckers_et_al_2023_Tabulated_Database_Uloop_water_heat.txt',
    ]

    for(let e in exampleFiles){
        let exampleFile = exampleFiles[e]
        console.log(exampleFile)

        $('#examples-selector').append($('<option value="' + exampleFile + '">' + exampleFile + '</option>'))
    }
}

$(document).ready(function () {
    /* break us out of any containing iframes */
    if (top !== self) {
        top.location.replace(self.location.href);
    }

    if(location.hostname.indexOf('localhost') != -1){
        const path = 'get-geophires-result'
        const prodUrl = `https://nmgmk2gu5b.execute-api.us-west-2.amazonaws.com/${path}`
        const devUrl = `https://d4nshmdoig.execute-api.us-west-2.amazonaws.com/${path}`
        $('form.apiActionForm').attr('action',devUrl)
    }

    $('#domain-breadcrumb').html(`<a href="${location.origin}">${location.hostname}</a>`)

    google.charts.load('current', {'packages': ['corechart']});

    GUIDED_PARAMS_FORM = new GeophiresParametersForm(
        $('#geophires_param_form'),
        function (params) {
            TEXT_INPUT_PARAMS_FORM.setInputParameters(params['geophires_input_parameters'])

            $('textarea[name="geophires_input_parameters"]')
                .val(JSON.stringify(params['geophires_input_parameters'], null, 4))
                .submit()
        }
    )

    TEXT_INPUT_PARAMS_FORM = new GeophiresTextInputParameters(
        $('#geophires_text_input_parameters'),
        function (params) {
            GUIDED_PARAMS_FORM.setInputParameters(params['geophires_input_parameters'])

            $('textarea[name="geophires_input_parameters"]')
                .val(JSON.stringify(params['geophires_input_parameters'], null, 4))
                .submit()
        })


    let defaultParams = {
        "Gradient 1": 50,
        "Reservoir Depth": 3,
        "End-Use Option": 2,
        "Reservoir Model": 1,
        "Time steps per year": 6,
    }

    try {
        console.log('URL hash is:', getUrlHash())
        let paramsFromHash = new URLSearchParams(getUrlHash()).get('geophires_input_parameters')
        console.log(`URL hash as search params: ${paramsFromHash}`)
        if (paramsFromHash) {
            defaultParams = JSON.parse(paramsFromHash)
        }
    } catch (error) {
        console.log('Error loading params from URL hash:', error)
    }

    setFormInputParameters(defaultParams)

    setAttributesFromDataProperties()

    configureExampleSelector()
})
