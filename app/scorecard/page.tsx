import {ShadcnScorecard} from '@/components/scorecard'
import  EventCreationForm from '@/components/dashboard/eventForm'

export default function Scorecard(){
    return(
        <div>
            <ShadcnScorecard title="Scorecard" totalTogglesO={35}/>
        </div>
    )
}