import React from "react";
import {
  useForm,
  FormProvider,
  useFieldArray,
  Controller,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

const defaultField = {
  key: "",
  type: "String",
  children: [],
};

const SchemaBuilder = () => {
  const methods = useForm({
    defaultValues: {
      schema: [],
    },
  });

  const { control, getValues, register } = methods;

  // 🟡 watch for reactive updates to schema
  const watchedSchema = useWatch({ control, name: "schema" });

  return (
    <FormProvider {...methods}>
      <Tabs defaultValue="builder" className="w-full">
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <FieldItem
            nestName="schema"
            control={control}
            register={register}
            getValues={getValues}
          />
        </TabsContent>

        <TabsContent value="json">
          <pre className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">
            {JSON.stringify(buildSchema(watchedSchema), null, 2)}
          </pre>
        </TabsContent>
      </Tabs>
    </FormProvider>
  );
};

function FieldItem({ nestName, control, register, getValues }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: nestName,
  });

  return (
    <>
      {fields.map((field, index) => {
        const fieldPath = `${nestName}[${index}]`;
        const fieldType = getValues(`${fieldPath}.type`);

        return (
          <Card key={field.id} className="p-4 my-2">
            <div className="flex items-center gap-3 flex-wrap">
              <Input
                placeholder="Key"
                {...register(`${fieldPath}.key`)}
                className="w-48"
              />

              <Controller
                name={`${fieldPath}.type`}
                control={control}
                defaultValue="String"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="String">String</SelectItem>
                      <SelectItem value="Number">Number</SelectItem>
                      <SelectItem value="Nested">Nested</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <Button
                variant="destructive"
                onClick={() => remove(index)}
                size="icon"
              >
                <Trash2 size={16} />
              </Button>
            </div>

            {fieldType === "Nested" && (
              <div className="ml-6 mt-4">
                <FieldItem
                  nestName={`${fieldPath}.children`}
                  control={control}
                  register={register}
                  getValues={getValues}
                />
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => append({ ...defaultField })}
                >
                  <Plus className="mr-1" size={16} />
                  Add Nested Field
                </Button>
              </div>
            )}
          </Card>
        );
      })}

      <Button className="mt-4" onClick={() => append({ ...defaultField })}>
        <Plus className="mr-2" size={16} />
        Add Field
      </Button>
    </>
  );
}

function buildSchema(fields) {
  return fields?.map((field) => {
    if (field.type === "Nested") {
      return {
        key: field.key,
        type: "Nested",
        children: buildSchema(field.children || []),
      };
    }
    return {
      key: field.key,
      type: field.type,
      default: field.type === "String" ? "" : 0,
    };
  });
}

export default SchemaBuilder;
