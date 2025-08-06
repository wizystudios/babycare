-- Create triggers for notifications
CREATE OR REPLACE TRIGGER consultation_request_notifications
  AFTER INSERT OR UPDATE ON consultation_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_consultation_status();

CREATE OR REPLACE TRIGGER review_notifications
  AFTER INSERT ON doctor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_review_created();

CREATE OR REPLACE TRIGGER report_sharing_notifications
  AFTER UPDATE ON baby_reports
  FOR EACH ROW
  EXECUTE FUNCTION notify_report_shared();

-- Add the Healthcare route to the App
-- First, let's check if we need to create the Healthcare page route