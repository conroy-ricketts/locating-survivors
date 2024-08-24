import React, {useContext, useEffect, useState} from 'react'
import './caseList.css'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import {useLocation, useNavigate} from 'react-router-dom'
import ClipLoader from 'react-spinners/ClipLoader'
import AccessCaseViewContext from '../../context/accessCaseViewContext.tsx'
import {exportCase} from '../../utils/exportCase.tsx'

interface CaseForDisplay {
    id: string,
    lastUpdate: string,
    status: string,
    duration: string,
    phoneNumber: string
}

export default function CaseListScreen(props): JSX.Element {
    const [cases, setCases] = useState([])
    const [case_data_arr, set_case_data] = useState([])
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [showActiveOnly, setShowActiveOnly] = useState(true)
    const [sortOrder, setSortOrder] = useState('Duration: Low to High')
    const [initialCaseTimes, setInitialCaseTimes] = useState({})
    const { setAccessToCaseView } = useContext(AccessCaseViewContext)
    const [searchQuery, setSearchQuery] = useState('')

    CaseListScreen.propTypes = {
        user: PropTypes.object.isRequired
    }

    const { user } = props

    useEffect(() => {
        const fetchData = async () => {
            const fetchedCases = await getCases()
            setCases(fetchedCases[0])
            set_case_data(fetchedCases[1])
        }

        fetchData()
    }, [])

    function convertSingleDigitToDouble(digit: number): string {
        return digit.toString().length == 1 ? '0' +  digit.toString() : digit.toString()
    }

    function formattedDuration(createdAt) {
        const currentTime = new Date()
        const milliseconds = currentTime.getTime() - createdAt.getTime()
        const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000))
        const hours = Math.floor((milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
        const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000))

        const formattedDays = convertSingleDigitToDouble(days)
        const formattedHours = convertSingleDigitToDouble(hours)
        const formattedMinutes = convertSingleDigitToDouble(minutes)

        return `${formattedDays}:${formattedHours}:${formattedMinutes}`
    }

    async function getCases(): Promise<(CaseForDisplay[] | any[])[]> {
        setIsLoading(true)
        const userID = user.attributes.sub
        const url = `https://6u7yn5reri.execute-api.us-east-1.amazonaws.com/prod/case?user_id=${userID}`
        const headers = {
            Authorization: `Bearer ${sessionStorage.getItem('idToken')}`
        }
        const case_arr: CaseForDisplay[] = []
        const case_data_arr = []
        try {
            const response = await fetch(url, { headers })
            const data = await response.json()
            data.data.forEach(function (user_case: any) {
                const createdAt = new Date(user_case._createdAt)
                initialCaseTimes[user_case.id] = createdAt
                const formattedDifference = formattedDuration(createdAt)
                const formattedPhoneNumber = user_case.phone_number.replace( /(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')
                const display_case: CaseForDisplay = {
                    id: user_case.id,
                    lastUpdate: moment(user_case.time_updated).tz('America/New_York').format('lll'),
                    status: user_case.status,
                    duration: formattedDifference,
                    phoneNumber: formattedPhoneNumber
                }
                case_arr.push(display_case)
                case_data_arr.push(user_case)
            })
            setInitialCaseTimes(initialCaseTimes)
        } catch (error) {
            console.log('Error: ', error)
        }
        setIsLoading(false)
        return [case_arr, case_data_arr]
    }

    function getUserFullName(): string {
        return user.attributes.name
    }

    function navigateToViewCaseScreen(id) {
        setAccessToCaseView(true)
        const caseData = case_data_arr.find(caseItem => caseItem.id === id)

        navigate('/case_detail', { state: { caseData: caseData } })
    }

    function getCaseItem(
        id: string,
        key: number,
        lastUpdate: string,
        status: string,
        duration: string,
        phoneNumber: string
    ): JSX.Element {
        const caseData = case_data_arr.find(caseItem => caseItem.id === id)
        return (
            <div id='cl-ci-container' key={key}>
                <div id='cl-ci-left-pane'>
                    <p id='cl-cit-left-align' className='cl-ci-text'>{`Phone Number: ${phoneNumber}`}</p>
                    <p id='cl-cit-left-align' className='cl-ci-text'>{`Last Update: ${lastUpdate}`}</p>
                </div>
                <div id='cl-ci-middle-pane'>
                    <p id='cl-cit-center-align' className='cl-ci-text'>{`Duration: ${duration}`}</p>
                    <p id='cl-cit-center-align' className='cl-ci-text'>{`Status: ${status}`}</p>
                </div>
                <div id='cl-ci-right-pane'>
                    <button id='cl-ci-top-button' onClick={() => exportCase(caseData)}>Export...</button>
                    <button id='cl-ci-bottom-button' onClick={() => navigateToViewCaseScreen(id)}>View...</button>
                </div>
            </div>
        )
    }

    function navigateToNewCaseScreen() {
        navigate('/new_case')
    }

    function getCheckboxForActiveOnly(): JSX.Element {
        return (
            <div id='cl-radio-button-with-text'>
                <input
                    id='cl-radio-button'
                    name='clCheckbox'
                    type="checkbox"
                    checked={showActiveOnly}
                    onClick={() => setShowActiveOnly(!showActiveOnly)}
                />
                <p id='cl-radio-button-text'>Show Active Only</p>
            </div>
        )
    }

    function handleSortOrderChange(order: string) {
        setSortOrder(order)
    }

    function getRadioButtonWithText(text: string): JSX.Element {
        return (
            <div id='cl-radio-button-with-text'>
                <input
                    id='cl-radio-button'
                    name='clRadioButton'
                    type="radio"
                    onClick={() => handleSortOrderChange(text)}
                    defaultChecked={sortOrder === text}
                />
                <p id='cl-radio-button-text'>{text}</p>
            </div>
        )
    }

    return (
        <div id='cl-container'>
            <div id='cl-left-pane'>
                <div id='cl-lp-top-container'>
                    <p id='cl-lp-header-text'>Sort By...</p>
                    {getCheckboxForActiveOnly()}
                    {getRadioButtonWithText('Duration: Low to High')}
                    {getRadioButtonWithText('Duration: High to Low')}
                </div>
                <div id='cl-lp-bottom-container'>
                    <p className='cl-lp-user-info-text'>{getUserFullName()} (Operator)</p>
                    <button id='cl-lp-bottom-button' onClick={() => navigateToNewCaseScreen()}>New Case...</button>
                </div>
            </div>
            <div id='cl-main-content-pane'>
                <div id='cl-main-content-header'>
                    <button id='cl-header-left-button' onClick={navigateToNewCaseScreen}>Create New Case</button>
                    <p id='cl-header-center-text'>{`Case List for ${getUserFullName()}`}</p>
                    <input
                        type="text"
                        placeholder="Search by phone number or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        id='cl-search-bar'
                    />
                </div>
                <div id='cl-case-item-container'>
                    {isLoading ? <ClipLoader color='#002bff' loading={isLoading} size={150}/> :
                        cases
                            .filter(caseForDisplay => {
                                const searchLower = searchQuery.toLowerCase()
                                return (
                                    (!showActiveOnly || caseForDisplay.status === 'Open' || caseForDisplay.status === 'Pending Initial Update') &&
                                    (caseForDisplay.phoneNumber.toLowerCase().includes(searchLower) ||
                                        caseForDisplay.status.toLowerCase().includes(searchLower))
                                )
                            })
                            .sort((a, b) => {
                                if (sortOrder === 'Duration: Low to High') {
                                    return a.duration.localeCompare(b.duration)
                                } else if (sortOrder === 'Duration: High to Low') {
                                    return b.duration.localeCompare(a.duration)
                                } else {
                                    return 0
                                }
                            })
                            .map((caseForDisplay, index) => (
                                <React.Fragment key={index}>
                                    {getCaseItem(caseForDisplay.id, index, caseForDisplay.lastUpdate, caseForDisplay.status, caseForDisplay.duration, caseForDisplay.phoneNumber)}
                                </React.Fragment>
                            ))
                    }
                </div>
            </div>
        </div>
    )
}