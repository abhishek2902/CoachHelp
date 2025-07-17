progress = (questions_attempted.to_f / total_questions) * 100

→ Enter Code to Join Training
→ View Training Content (PDF or HTML)
→ Attempt Related Questions
→ Progress Updates as Questions are Answered
→ Option to Submit / Reattempt

→ Create Training (Title, Content, PDF Upload)
→ Add Questions
→ Generate Access Code
→ Track Learner Progress


to del: rails generate model Training title:string content_html:text code:string user:references allow_retries:boolean is_active:boolean 
to del: rails generate model TrainingQuestion training:references question:references position:integer
rails generate model TrainingAttempt user:references training:references responses_json:jsonb questions_attempted:integer started_at:datetime ended_at:datetime
to del: rails d migration UpdateTrainingsSchema
rails generate model TrainingEnrollment training:references user:references status:string started_at:datetime completed_at:datetime
to del: rails generate model TrainingSection name:string duration:integer training:references position:integer
rails generate migration MakeSectionsPolymorphic


rails generate model TrainingEnrollment training:references user:references status:string responses_json:jsonb questions_attempted:integer started_at:datetime completed_at:datetime
rails generate model TrainingSection name:string duration:integer frontend_temp_id:string training:references
rails generate migration ExtendTrainingEnrollmentsWithGuestAndScoringData

rails generate migration AddContentHtmlToTrainingSections content_html:text


training will have expiry date 
user :duration 10 days

accept by mail 
show acceptioted training


status pending, completed expired  in enroll
