import { supabase } from '@/integrations/supabase/client';

export interface MedicalDocument {
  id: string;
  babyId: string;
  userId: string;
  title: string;
  documentType: 'report' | 'prescription' | 'vaccination' | 'test_result' | 'other';
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  uploadedAt: Date;
}

export const getMedicalDocuments = async (babyId: string): Promise<MedicalDocument[]> => {
  const { data, error } = await supabase
    .from('medical_documents')
    .select('*')
    .eq('baby_id', babyId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;

  return data.map(record => ({
    id: record.id,
    babyId: record.baby_id,
    userId: record.user_id,
    title: record.title,
    documentType: record.document_type as MedicalDocument['documentType'],
    fileUrl: record.file_url,
    fileName: record.file_name,
    fileSize: record.file_size,
    uploadedAt: new Date(record.uploaded_at),
  }));
};

export const uploadMedicalDocument = async (
  file: File,
  babyId: string,
  title: string,
  documentType: MedicalDocument['documentType']
): Promise<MedicalDocument> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Upload file to storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `medical-documents/${babyId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('baby-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('baby-images')
    .getPublicUrl(filePath);

  // Save document record
  const { data, error } = await supabase
    .from('medical_documents')
    .insert({
      baby_id: babyId,
      user_id: user.id,
      title,
      document_type: documentType,
      file_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    babyId: data.baby_id,
    userId: data.user_id,
    title: data.title,
    documentType: data.document_type as MedicalDocument['documentType'],
    fileUrl: data.file_url,
    fileName: data.file_name,
    fileSize: data.file_size,
    uploadedAt: new Date(data.uploaded_at),
  };
};

export const deleteMedicalDocument = async (documentId: string): Promise<void> => {
  // Get document info first
  const { data: document, error: fetchError } = await supabase
    .from('medical_documents')
    .select('file_url')
    .eq('id', documentId)
    .single();

  if (fetchError) throw fetchError;

  // Extract file path from URL
  const url = new URL(document.file_url);
  const filePath = url.pathname.split('/storage/v1/object/public/baby-images/')[1];

  // Delete from storage
  if (filePath) {
    await supabase.storage
      .from('baby-images')
      .remove([filePath]);
  }

  // Delete record
  const { error } = await supabase
    .from('medical_documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;
};