if (submitted) {
    return (
      <Card className={`w-full max-w-md mx-auto ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-800">Lead Cadastrado com Sucesso!</h3>
            <p className="text-muted-foreground">
              Obrigado pelo seu interesse. Nossa equipe entrará em contato em breve.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={resetForm} variant="outline">
                Cadastrar Novo Lead
              </Button>
              {onCancel && (
                <Button onClick={onCancel} variant="default">
                  Voltar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentFormStep = FORM_STEPS[currentStep];
  const isLastStep = currentStep === FORM_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const renderFormStepContent = () => {
    if (currentFormStep.type === 'text' || currentFormStep.type === 'email' || currentFormStep.type === 'tel') {
      return (
        <Input
          type={currentFormStep.type}
          value={formData[currentFormStep.fieldName] || ''}
          onChange={(e) => handleInputChange(currentFormStep.fieldName, e.target.value)}
          placeholder={`Digite seu ${currentFormStep.fieldName === 'name' ? 'nome completo' : 
            currentFormStep.fieldName === 'email' ? 'e-mail profissional' : 'telefone com DDD'}`}
        />
      );
    }

    if (currentFormStep.type === 'radio' && currentFormStep.options) {
      return (
        <RadioGroup
          value={formData[currentFormStep.fieldName] || ''}
          onValueChange={(value) => handleInputChange(currentFormStep.fieldName, value)}
          className="space-y-3"
        >
          {currentFormStep.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    return null;
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-center text-xl">
          Formulário Turbo
        </CardTitle>
        <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / (FORM_STEPS.length + 1)) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-medium">{currentFormStep.question}</h3>
          </div>

          {renderFormStepContent()}

          {isLastStep && (
            <div className="pt-4">
              <div className="flex items-start space-x-3 pb-4">
                <Checkbox
                  id="lgpd_consent"
                  checked={formData.lgpd_consent || false}
                  onCheckedChange={(checked) => 
                    handleInputChange('lgpd_consent', checked === true)
                  }
                />
                <div>
                  <Label 
                    htmlFor="lgpd_consent" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    Aceito os termos de privacidade e autorizo o uso dos meus dados *
                  </Label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={isFirstStep ? onCancel : handlePrevious}
              disabled={loading}
            >
              {isFirstStep ? 'Cancelar' : 'Anterior'}
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="gap-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {isLastStep ? 'Finalizar' : 'Próximo'}
                  {!isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TurboLeadForm;