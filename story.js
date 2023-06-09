import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Reader from '.'

class Wrapper extends Component {
  constructor(props) {
    super(props)
    this.state = { cameraId: undefined, delay: 500, devices: [], loading: false }
  }

  componentWillMount() {
    const { selectFacingMode } = this.props

    if (navigator && selectFacingMode) {
      this.setState({
        loading: true,
      })

      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const videoSelect = []
          devices.forEach((device) => {
            if (device.kind === 'videoinput') {
              videoSelect.push(device)
            }
          })
          return videoSelect
        })
        .then((devices) => {
          this.setState({
            cameraId: devices[0].deviceId,
            devices,
            loading: false,
          })
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  selectCamera = () => {
    return this.state.cameraId
  }

  render() {
    const { selectFacingMode, selectDelay, legacyMode } = this.props
    const { loading, cameraId, devices } = this.state

    const previewStyle = { width: 320 }
    return (
      <div>
        {
          selectFacingMode && devices.length && (
            <select
              onChange={e => {
                const value = e.target.value
                this.setState({ cameraId: undefined }, () => {
                  this.setState({ cameraId: value })
                })
              }}
            >
              {devices.map((deviceInfo, index) => (
                <React.Fragment key={deviceInfo.deviceId}><option value={deviceInfo.deviceId}>{deviceInfo.label || `camera ${index}`}</option></React.Fragment>
              ))}
            </select>
          )
        }
        {
          selectDelay && (
            <div>
              <button onClick={() => this.setState({ delay: 0 })}>
                Disable Delay
              </button>
              <input
                placeholder="Delay in ms"
                type="number"
                value={this.state.delay}
                onChange={e =>
                  this.setState({ delay: parseInt(e.target.value) })}
              />
            </div>
          )
        }
        {!loading && (<Reader
          onError={console.error}
          onScan={action('Scan')}
          onLoad={action('Load')}
          delay={this.state.delay}
          constraints={cameraId && ({ audio: false, video: { deviceId: cameraId } })}
        />)}
        {
          legacyMode && (
            <button onClick={() => this.refs.reader.openImageDialog()}>
              Open Image Dialog
            </button>
          )
        }
      </div>
    )
  }
}

storiesOf("QR Reader", module)
  .add('Camera not specified', () => <Wrapper />)
  .add('Choose camera', () => <Wrapper selectFacingMode />)
  .add('Legacy mode', () => <Wrapper legacyMode />)
  .add('Choose delay', () => <Wrapper selectDelay />)
