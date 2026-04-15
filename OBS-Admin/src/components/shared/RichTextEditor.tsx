import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function RichTextEditor({ value, onChange }) {
  return (
    <div className="editor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        onChange={(event, editor) => {
          onChange(editor.getData());
        }}
        config={{
          toolbar: [
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "|",
            "fontSize",
            "fontFamily",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "alignment",
            "|",
            "undo",
            "redo",
          ],
          clipboard: {
            pasteAsPlainText: false,
          },
        }}
      />
    </div>
  );
}
