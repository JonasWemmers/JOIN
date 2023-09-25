<?php

########### CONFIG ###########################

$redirect = 'success_forget_pw.html';                 //setting redirection to success page 

########### CONFIG END #######################


##############################################
#
#   SENDING PERSONALIZED EMAIL TO USER
#
##############################################

switch ($_SERVER['REQUEST_METHOD']) {
    case ("OPTIONS"): //Allow preflighting to take place.
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST");
        header("Access-Control-Allow-Headers: content-type");
        exit;
    case ("POST"): //Send the email;
        header("Access-Control-Allow-Origin: *");

        $email = $_POST['email'];           //getting email from inputfield and putting it in a variable

        $message = "Hello,\n                            
        \nPlease click the following link to reset your password for your Join account:\n
        \nhttp://gruppe-557.developerakademie.net/reset_password.html?email={$email}\n   
        \nIf you didn't request to reset your password, please disregard this email.\n
        \nBest regards,\n
        \nJoin team\n";
                       // message for the user with personilzed link to reset password
     

        $recipient = $email;                // setting recipient to the email from inputfield
        $subject = "Join - Reset password";
        $headers = "From:  noreply@join.de";

        mail($recipient, $subject, $message, $headers); //sending out email with the parameters inside --> () the round brackets
        
        header("Location: " . $redirect);  // redirect to success page

        break;
    default: //Reject any non POST or OPTIONS requests.
        header("Allow: POST", true, 405);
        exit;
}
