"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Upload, Pencil, Trash2 } from "lucide-react";

interface AdminQuestion {
  id: string;
  subject: string;
  readingTopic: string | null;
  mathTopic: string | null;
  difficulty: string;
  prompt: string;
  passage: string | null;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correct: string;
  explanation: string;
  tags: string | null;
}

const EMPTY: Omit<AdminQuestion, "id"> = {
  subject: "MATH",
  readingTopic: null,
  mathTopic: "ALGEBRA",
  difficulty: "MEDIUM",
  prompt: "",
  passage: null,
  choiceA: "",
  choiceB: "",
  choiceC: "",
  choiceD: "",
  correct: "A",
  explanation: "",
  tags: null,
};

export default function AdminQuestionsPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminQuestion | (typeof EMPTY) | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin-questions", search, subject, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      if (subject !== "all") params.set("subject", subject);
      const res = await fetch(`/api/admin/questions?${params}`);
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (q: AdminQuestion | Omit<AdminQuestion, "id">) => {
      const url = editingId ? `/api/admin/questions/${editingId}` : "/api/admin/questions";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(q) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save.");
      return result;
    },
    onSuccess: () => {
      toast.success(editingId ? "Question updated" : "Question created");
      setEditing(null);
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast.success("Question deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/questions/import", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Import failed.");
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Imported ${result.imported} questions${result.skipped ? `, skipped ${result.skipped}` : ""}`);
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <AdminShell>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs bg-white/10 border-white/20 text-white placeholder:text-white/40"
        />
        <Select value={subject} onValueChange={(v) => setSubject(v ?? "all")}>
          <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            <SelectItem value="READING">Reading</SelectItem>
            <SelectItem value="MATH">Math</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importMutation.mutate(file);
            e.target.value = "";
          }} />
          <Button variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />Import CSV
          </Button>
          <Button onClick={() => { setEditing(EMPTY); setEditingId(null); }} className="btn-brand hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />New Question
          </Button>
        </div>
      </div>

      <p className="mb-2 text-sm text-white/50">{data?.total?.toLocaleString() ?? "—"} total questions</p>

      <div className="glass-card overflow-x-auto rounded-2xl p-2">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/60">Subject</TableHead>
              <TableHead className="text-white/60">Difficulty</TableHead>
              <TableHead className="text-white/60">Prompt</TableHead>
              <TableHead className="text-white/60 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.questions?.map((q: AdminQuestion) => (
              <TableRow key={q.id} className="border-white/10">
                <TableCell>{q.subject}</TableCell>
                <TableCell>{q.difficulty}</TableCell>
                <TableCell className="max-w-md truncate">{q.prompt}</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(q); setEditingId(q.id); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(q.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white">Previous</Button>
        <span className="text-sm text-white/60">Page {page}</span>
        <Button variant="outline" disabled={!data || page * 20 >= data.total} onClick={() => setPage((p) => p + 1)} className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white">Next</Button>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl border-white/10 bg-[var(--scheme-app-c)] text-white">
          <DialogHeader><DialogTitle>{editingId ? "Edit Question" : "New Question"}</DialogTitle></DialogHeader>
          {editing && (
            <QuestionForm
              initial={editing}
              onSave={(values) => saveMutation.mutate(values)}
              saving={saveMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

type QuestionFormValues = AdminQuestion | Omit<AdminQuestion, "id">;

function QuestionForm({
  initial,
  onSave,
  saving,
}: {
  initial: QuestionFormValues;
  onSave: (v: QuestionFormValues) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<QuestionFormValues>(initial);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Subject</Label>
          <Select value={form.subject} onValueChange={(v) => v && setForm({ ...form, subject: v })}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="READING">Reading</SelectItem><SelectItem value="MATH">Math</SelectItem></SelectContent>
          </Select>
        </div>
        <div>
          <Label>Difficulty</Label>
          <Select value={form.difficulty} onValueChange={(v) => v && setForm({ ...form, difficulty: v })}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="EASY">Easy</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HARD">Hard</SelectItem></SelectContent>
          </Select>
        </div>
      </div>

      {form.subject === "READING" && (
        <div>
          <Label>Passage</Label>
          <Textarea value={form.passage ?? ""} onChange={(e) => setForm({ ...form, passage: e.target.value })} className="bg-white/10 border-white/20 text-white" rows={4} />
        </div>
      )}

      <div>
        <Label>Prompt</Label>
        <Textarea value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} className="bg-white/10 border-white/20 text-white" rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["choiceA", "choiceB", "choiceC", "choiceD"] as const).map((key, i) => (
          <div key={key}>
            <Label>Choice {String.fromCharCode(65 + i)}</Label>
            <Input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="bg-white/10 border-white/20 text-white" />
          </div>
        ))}
      </div>

      <div>
        <Label>Correct Answer</Label>
        <Select value={form.correct} onValueChange={(v) => v && setForm({ ...form, correct: v })}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
          <SelectContent>{["A", "B", "C", "D"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div>
        <Label>Explanation</Label>
        <Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} className="bg-white/10 border-white/20 text-white" rows={2} />
      </div>

      <DialogFooter>
        <Button disabled={saving} onClick={() => onSave(form)} className="btn-brand hover:opacity-90">
          {saving ? "Saving..." : "Save Question"}
        </Button>
      </DialogFooter>
    </div>
  );
}
