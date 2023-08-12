// noinspection JSJQueryEfficiency

'use strict';

class GeophiresParametersForm {

    _getElt() {
        return $(this.$elt)
    }

    constructor($formElt, onSubmit) {
        this.$elt = $formElt

        $(this.$elt).submit(function () {
            let paramsRequest = {
                'geophires_input_parameters': {}
            }


            $.map($($formElt).find('.geophires-parameters input[type="text"]'), function (value, index) {
                if (value.name) {
                    paramsRequest['geophires_input_parameters'][value.name] = parseIfNumber(value.value)
                }
            })

            console.log('Constructed params request object:', JSON.stringify(paramsRequest))
            onSubmit(paramsRequest)

            return false
        })
    }

    setInputParameters(inputParameters) {
        this.inputParameters = inputParameters
        let elt = this._getElt()
        elt.empty()

        let _this = this
        let tbl = $('<table class="mui-table geophires-parameters"></table>')
        for (let paramName in inputParameters) {
            let paramData = inputParameters[paramName]

            let removeButton = $(`<button type="button" class="mui-btn mui-btn--small">Remove</button>`)
            removeButton.on("click", function () {
                _this._removeInputParameter(paramName)
            })
            tbl.append($(`
                <tr>
                    <td>
                        <label for="${paramName}">${paramName}</label>
                    </td>
                    <td>
                        <input type="text" name="${paramName}" value="${paramData}"/>
                    </td>
                </tr>
            `).append($('<td>').append(removeButton)))
        }

        tbl.append(`
            <tr>
                <td colspan="3">
                    <br/>
                    <div class="mui-divider"></div>
                    <br/>
                </td>
            </tr>

            <tr>
                <!--<td>Parameter</td>-->
                <td id="add_param_selector" colspan="3">
                    <input type="text"
                        id="add_param_name"
                        placeholder="New Parameter Name"
                        class="hidden" />
                </td>
            </tr>
            <tr>
                <td>Type</td>
                <td id="selected_param_type" colspan="2"></td>
            </tr>
            <tr>
                <td>Units</td>
                <td id="selected_param_unit" colspan="2"></td>
            </tr>
            <tr>
                <td style="vertical-align: top;">Description</td>
                <td id="selected_param_description" colspan="2"></td>
            </tr>
            <tr>
                <td>
                    Value
                </td>
                <td>
                    <input type="text" id="add_param_value" placeholder="Parameter Value"/>
                </td>
                <td>
                    <button type="button" class="mui-btn" id="add_param_btn">Add Parameter</button>
                </td>
            </tr>`)
        elt.append(tbl)

        $('#add_param_btn').on('click', function () {
            if ($('#add_param_name').val()) {
                _this.inputParameters[$('#add_param_name').val()] = $('#add_param_value').val()
                _this.setInputParameters(_this.inputParameters)
            }
        })

        elt.append(`
                <div class="mui-divider"></div>
                <br/>
                <input type="submit"
                           value="Run GEOPHIRES"
                           class="mui-btn mui-btn--primary mui-btn--raised" />
                            <div class="mui-divider" style="clear:both;"></div>
        `)

        $.getJSON('geophires-request.json', function (data) {
            console.log('Got schema JSON:', data)
            _this._setParameterOptions(data)
        })
    }

    _setParameterOptions(schema) {
        let properties = schema['properties']

        let options = ''
        for (let propertyName in properties) {
            let property = properties[propertyName]
            property['name'] = propertyName
            let propertyJson = JSON.stringify(property)
            options += `<option value='${propertyJson}'>${propertyName}</option>`
        }

        $('#add_param_selector').append($(`
              <div class="mui-select">
                <select>
                    ${options}
                </select>
                <label>Choose Parameter</label>
                </div>
            `))

        $('#add_param_selector select').on('change', function () {
            let selectedParam = JSON.parse($(this).val())
            let selectedParamName = selectedParam['name']
            console.log('Add param selection', selectedParamName)
            $('#add_param_name').val(selectedParamName)

            $('#selected_param_description').text(`
                ${selectedParam['description']}
            `)

            $('#selected_param_type').html(`
                <span style="font-family: monospace">${selectedParam['type']}</span>
            `)

            let unitElt = $('#selected_param_unit')
            if(selectedParam['units'] !== null){
                unitElt.text(selectedParam['units'])
            }else{
                unitElt.text('N/A')
            }
        });

        $('#add_param_selector select').val($(`#add_param_selector select option`)
            .eq(Object.keys(properties).indexOf('Number of Fractures')).val()).change()
    }

    _removeInputParameter(paramName) {
        delete this.inputParameters[paramName]
        this.setInputParameters(this.inputParameters)
    }
}

class GeophiresTextInputParameters {
    constructor($formElt, onSubmit) {
        $($formElt).append($(`
            <textarea rows="13"></textarea>
            <input type="submit"
            value="Run GEOPHIRES"
             class="mui-btn mui-btn--primary mui-btn--raised" />
        `))
        this.$textareaElt = $($formElt).find('textarea')

        let _this = this
        $($formElt).submit(function () {
            let requestParams = {
                'geophires_input_parameters': _this.getParameters()
            }
            console.log('text input as params obj', requestParams)
            onSubmit(requestParams)
            return false
        })
    }

    setInputParameters(inputParametersObj) {
        this.inputParameters = inputParametersObj

        let txt = this._getParametersText()
        $(this.$textareaElt).val(txt)
        return txt
    }

    _getParametersText() {
        let txt = ''
        for (let paramName in this.inputParameters) {
            let paramValue = this.inputParameters[paramName]
            txt += `${paramName}, ${paramValue}\n`
        }
        return txt
    }

    getParameters() {
        let params = {}

        let lines = $(this.$textareaElt).val().split('\n')
        for (let l in lines) {
            let line = lines[l].split(',')

            if (line && line.length >= 2) {
                let paramName = line[0].trim()
                let paramValue = parseIfNumber(line[1].trim())
                params[paramName] = paramValue
            } else {
                console.log('Skipping text input line:', line)
            }

        }

        return params
    }
}
