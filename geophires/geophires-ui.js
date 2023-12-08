function setLoading(isLoading) {
    let loader = document.getElementById('loading')
    if (isLoading) {
        setVisible(loader, true)
        resetGenerationProfileGraphs()
        setVisible($('#params-deeplink'), false)
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

const CCUS_PROFILE_KEY = 'CCUS PROFILE'
const EXTENDED_ECONOMICS_PROFILE_KEY = 'EXTENDED ECONOMIC PROFILE'
const POWER_PROFILE_KEY = 'POWER GENERATION PROFILE'
const EXTRACTION_PROFILE_KEY = 'HEAT AND/OR ELECTRICITY EXTRACTION AND GENERATION PROFILE'

function renderGenerationProfileGraphs(resultsData) {
    setVisible(document.getElementById('generation-profile-graphs'), true)

    let powerGenerationProfile = resultsData[POWER_PROFILE_KEY]

    let powerGenerationProfileChart = new google.visualization.LineChart(
        document.getElementById('power-generation-profile-chart')
    );

    powerGenerationProfileChart.draw(
        google.visualization.arrayToDataTable(powerGenerationProfile),
        {
            title: POWER_PROFILE_KEY,
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


    let extractionProfileChartElt = document.getElementById('heat-electricity-extraction-generation-profile-chart')
    if(EXTRACTION_PROFILE_KEY in resultsData) {
        setVisible(extractionProfileChartElt, true)
        let heatElectricityExtractionGenerationProfile = resultsData[EXTRACTION_PROFILE_KEY]
        let heatElectricityExtractionGenerationProfileChart = new google.visualization.LineChart(
            extractionProfileChartElt
        );

        heatElectricityExtractionGenerationProfileChart.draw(
            google.visualization.arrayToDataTable(heatElectricityExtractionGenerationProfile),
            {
                title: EXTRACTION_PROFILE_KEY,
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
    } else {
        setVisible(extractionProfileChartElt, false)
    }

    let extendedEconomicsProfileChartElt = document.getElementById('extended-economics-profile-chart')
    if(EXTENDED_ECONOMICS_PROFILE_KEY in resultsData) {
        setVisible(extendedEconomicsProfileChartElt, true)
        let profile = resultsData[EXTENDED_ECONOMICS_PROFILE_KEY]
        let chart = new google.visualization.LineChart(
            extendedEconomicsProfileChartElt
        );

        chart.draw(
            google.visualization.arrayToDataTable(profile),
            {
                title: EXTENDED_ECONOMICS_PROFILE_KEY,
                curveType: 'function',
                legend: {position: 'bottom'},
                hAxis: {
                    title: 'Year'
                },
            }
        );
    } else {
        setVisible(extendedEconomicsProfileChartElt, false)
    }

    let ccusProfileChartElt = document.getElementById('ccus-profile-chart')
    if(CCUS_PROFILE_KEY in resultsData) {
        setVisible(ccusProfileChartElt, true)
        let profile = resultsData[CCUS_PROFILE_KEY]
        let chart = new google.visualization.LineChart(
            ccusProfileChartElt
        );

        chart.draw(
            google.visualization.arrayToDataTable(profile),
            {
                title: CCUS_PROFILE_KEY,
                curveType: 'function',
                legend: {position: 'bottom'},
                hAxis: {
                    title: 'Year'
                },
                series: {
                    // Gives each series an axis name that matches the Y-axis below.
                    0: {targetAxisIndex: 1},
                    1: {targetAxisIndex: 0},
                    2: {targetAxisIndex: 0},
                    3: {targetAxisIndex: 0},
                    4: {targetAxisIndex: 0},
                    5: {targetAxisIndex: 0},
                    6: {targetAxisIndex: 0},
                    7: {targetAxisIndex: 0},
                },
                vAxes: {
                    // Adds titles to each axis.
                    1: {title: 'lbs'}
                },
            }
        );
    } else {
        setVisible(ccusProfileChartElt, false)
    }
}

function submitForm(oFormElement) {
    let parsed_params = JSON.parse(oFormElement.querySelector('textarea[name="geophires_input_parameters"]').value)

    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
        console.debug('Got response', xhr.responseText, xhr)
        setLoading(false)

        let resultsText = ''
        if (xhr.status !== 200) {
            let errorMsg = ''
            if (xhr.statusText) {
                errorMsg += `${xhr.statusText}: `
            }
            try {
                errorMsg += `${JSON.parse(xhr.responseText)['error']}`
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

        let resultsDisplayData = Object.assign({}, resultsData)
        delete resultsDisplayData[POWER_PROFILE_KEY]
        delete resultsDisplayData[EXTRACTION_PROFILE_KEY]
        delete resultsDisplayData[EXTENDED_ECONOMICS_PROFILE_KEY]
        delete resultsDisplayData[CCUS_PROFILE_KEY]

        for (let resultsKey in resultsDisplayData) {
            let resultsEntry = resultsDisplayData[resultsKey]
            if (resultsEntry && Reflect.ownKeys(resultsEntry).length) {
                // I'm sure there's a one-liner for this...
                allNull = true
                for (let k in resultsEntry) {
                    if (resultsEntry[k] !== null) {
                        allNull = false
                        break
                    }
                }

                if (!allNull) {
                    $(resultsTable).append($(`<thead><tr><th colspan="2">${resultsKey}</th></tr></tr></thead>`))
                    $(resultsTable).append(getTbody(resultsEntry))
                }
            }
        }

        $('#results').empty()
            .append(resultsTable)

        renderGenerationProfileGraphs(resultsData)

        setVisible($('#params-deeplink'), true)
    }

    xhr.onerror = function () {
        console.error('xhr onerror triggered', xhr)
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
    // setUrlHash(hashParams.toString())
    let url = new URL(location.href)
    url.hash = btoa(hashParams.toString())
    $('#params-deeplink').attr('href', url)

    return false
}

let GUIDED_PARAMS_FORM = null
let TEXT_INPUT_PARAMS_FORM = null

function setFormInputParameters(inputParameterObj) {
    GUIDED_PARAMS_FORM.setInputParameters(inputParameterObj)
    TEXT_INPUT_PARAMS_FORM.setInputParameters(inputParameterObj)
}

function configureExampleSelector() {
    $('#run-example-btn').on('click', function () {
        let exampleFile = $('#examples-selector').val()
        console.debug('Example', exampleFile, 'clicked')
        $.get('examples/' + exampleFile, function (data) {
            console.debug('Got example data', data)
            $('#geophires_text_input_parameters textarea').val(data)
            setTimeout(function () {
                $('#geophires_text_input_parameters').submit()
                mui.tabs.activate('pane-default-3')
            }, 100)
        })
    })


    let exampleFiles = [
        'example1.txt',
        'example1_outputunits.txt',
        'example1_addons.txt',
        'example2.txt',
        'example3.txt',
        'example4.txt',
        'example5.txt',
        'example8.txt',
        'example9.txt',
        'example10_HP.txt',
        'example11_AC.txt',
        'example12_DH.txt',
        'example13.txt',
        'Beckers_et_al_2023_Tabulated_Database_Coaxial_sCO2_heat.txt',
        'Beckers_et_al_2023_Tabulated_Database_Coaxial_water_heat.txt',
        'Beckers_et_al_2023_Tabulated_Database_Uloop_sCO2_elec.txt',
        'Beckers_et_al_2023_Tabulated_Database_Uloop_sCO2_heat.txt',
        'Beckers_et_al_2023_Tabulated_Database_Uloop_water_elec.txt',
        'Beckers_et_al_2023_Tabulated_Database_Uloop_water_heat.txt',
        'SUTRAExample1.txt',
        'example_multiple_gradients.txt'
    ]

    for (let e in exampleFiles) {
        let exampleFile = exampleFiles[e]
        $('#examples-selector').append($(`<option value="${exampleFile}">${exampleFile}</option>`))
    }
}

$(document).ready(function () {
    /* break us out of any containing iframes */
    if (top !== self) {
        top.location.replace(self.location.href);
    }

    if (location.hostname.indexOf('localhost') !== -1) {
        const path = 'get-geophires-result'
        const url = `https://d4nshmdoig.execute-api.us-west-2.amazonaws.com/${path}`
        $('form.apiActionForm').attr('action', url)

        setVisible($('#json-input-tab'), true)
    }

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
        "Reservoir Model": 1,
        "Reservoir Depth": 3,
        "Gradient 1": 50,
        "End-Use Option": 2,
        "Time steps per year": 6,
    }

    try {
        console.debug('URL hash is:', getUrlHash())
        let paramsFromHash = new URLSearchParams(getUrlHash()).get('geophires_input_parameters')
        console.debug(`URL hash as search params: ${paramsFromHash}`)
        if (paramsFromHash) {
            defaultParams = JSON.parse(paramsFromHash)
        }
    } catch (error) {
        console.error('Error loading params from URL hash:', error)
    }

    setFormInputParameters(defaultParams)

    setAttributesFromDataProperties()

    configureExampleSelector()
})
